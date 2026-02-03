#!/usr/bin/env python3
"""
Finetuning Script for Console Homepage AI Models

Supports multiple finetuning approaches:
1. Unsloth + LoRA (recommended for efficiency)
2. Hugging Face Transformers + PEFT
3. MLX (for Apple Silicon Macs)
4. WebLLM model conversion (for browser deployment)

Usage:
    python finetune.py --method unsloth --model Qwen/Qwen2.5-0.5B-Instruct
    python finetune.py --method transformers --model HuggingFaceTB/SmolLM2-360M-Instruct
    python finetune.py --method mlx --model mlx-community/Qwen2.5-0.5B-Instruct
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import List, Dict, Any

def load_jsonl_dataset(file_path: str) -> List[Dict[str, Any]]:
    """Load JSONL dataset"""
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            data.append(json.loads(line.strip()))
    return data

def save_jsonl_dataset(data: List[Dict[str, Any]], file_path: str):
    """Save dataset as JSONL"""
    with open(file_path, 'w', encoding='utf-8') as f:
        for item in data:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')

def split_dataset(data: List[Dict[str, Any]], train_ratio: float = 0.9):
    """Split dataset into train and eval"""
    split_idx = int(len(data) * train_ratio)
    return data[:split_idx], data[split_idx:]

# ============================================================================
# Method 1: Unsloth + LoRA (Recommended)
# ============================================================================

def finetune_with_unsloth(
    model_name: str,
    train_data_path: str,
    output_dir: str,
    config: Dict[str, Any]
):
    """
    Finetune using Unsloth (fastest, most memory-efficient)
    
    Install: pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
    """
    try:
        from unsloth import FastLanguageModel
        from trl import SFTTrainer
        from transformers import TrainingArguments
        import torch
    except ImportError:
        print("Error: Unsloth not installed. Install with:")
        print("pip install \"unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git\"")
        sys.exit(1)
    
    print(f"🚀 Finetuning with Unsloth: {model_name}")
    
    # Load model with Unsloth optimizations
    max_seq_length = config.get('max_seq_length', 2048)
    load_in_4bit = config.get('load_in_4bit', True)
    
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=model_name,
        max_seq_length=max_seq_length,
        dtype=None,  # Auto-detect
        load_in_4bit=load_in_4bit,
    )
    
    # Add LoRA adapters
    model = FastLanguageModel.get_peft_model(
        model,
        r=config.get('lora_r', 16),
        target_modules=config.get('lora_target_modules', [
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj",
        ]),
        lora_alpha=config.get('lora_alpha', 16),
        lora_dropout=config.get('lora_dropout', 0),
        bias="none",
        use_gradient_checkpointing="unsloth",
        random_state=config.get('seed', 3407),
    )
    
    # Load and format dataset
    data = load_jsonl_dataset(train_data_path)
    train_data, eval_data = split_dataset(data, config.get('train_ratio', 0.9))
    
    # Format for training
    def format_prompt(example):
        messages = example['messages']
        text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
        return {"text": text}
    
    # Prepare datasets
    from datasets import Dataset
    train_dataset = Dataset.from_list([format_prompt(ex) for ex in train_data])
    eval_dataset = Dataset.from_list([format_prompt(ex) for ex in eval_data]) if eval_data else None
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        per_device_train_batch_size=config.get('batch_size', 2),
        per_device_eval_batch_size=config.get('batch_size', 2),
        gradient_accumulation_steps=config.get('gradient_accumulation_steps', 4),
        warmup_steps=config.get('warmup_steps', 10),
        num_train_epochs=config.get('num_epochs', 3),
        learning_rate=config.get('learning_rate', 2e-4),
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=config.get('logging_steps', 10),
        optim=config.get('optimizer', "adamw_8bit"),
        weight_decay=config.get('weight_decay', 0.01),
        lr_scheduler_type=config.get('lr_scheduler', "linear"),
        seed=config.get('seed', 3407),
        save_strategy="steps",
        save_steps=config.get('save_steps', 100),
        evaluation_strategy="steps" if eval_dataset else "no",
        eval_steps=config.get('eval_steps', 100) if eval_dataset else None,
        load_best_model_at_end=True if eval_dataset else False,
        report_to=config.get('report_to', 'none'),
    )
    
    # Trainer
    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        dataset_text_field="text",
        max_seq_length=max_seq_length,
        args=training_args,
    )
    
    # Train
    print("📚 Starting training...")
    trainer.train()
    
    # Save model
    print(f"💾 Saving model to {output_dir}")
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    
    # Optionally merge and save full model
    if config.get('save_merged_model', False):
        merged_output = os.path.join(output_dir, "merged")
        print(f"🔗 Merging LoRA weights and saving to {merged_output}")
        model.save_pretrained_merged(merged_output, tokenizer, save_method="merged_16bit")
    
    print("✅ Training complete!")

# ============================================================================
# Method 2: Hugging Face Transformers + PEFT
# ============================================================================

def finetune_with_transformers(
    model_name: str,
    train_data_path: str,
    output_dir: str,
    config: Dict[str, Any]
):
    """
    Finetune using Hugging Face Transformers + PEFT
    
    Install: pip install transformers datasets peft trl bitsandbytes
    """
    try:
        from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, BitsAndBytesConfig
        from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
        from trl import SFTTrainer
        from datasets import Dataset
        import torch
    except ImportError:
        print("Error: Required packages not installed. Install with:")
        print("pip install transformers datasets peft trl bitsandbytes accelerate")
        sys.exit(1)
    
    print(f"🤗 Finetuning with Transformers + PEFT: {model_name}")
    
    # Quantization config
    load_in_4bit = config.get('load_in_4bit', True)
    if load_in_4bit:
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16,
            bnb_4bit_use_double_quant=True,
        )
    else:
        bnb_config = None
    
    # Load model and tokenizer
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True,
    )
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    
    # Prepare model for training
    if load_in_4bit:
        model = prepare_model_for_kbit_training(model)
    
    # LoRA config
    lora_config = LoraConfig(
        r=config.get('lora_r', 16),
        lora_alpha=config.get('lora_alpha', 16),
        target_modules=config.get('lora_target_modules', [
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj",
        ]),
        lora_dropout=config.get('lora_dropout', 0.05),
        bias="none",
        task_type="CAUSAL_LM",
    )
    
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()
    
    # Load and format dataset
    data = load_jsonl_dataset(train_data_path)
    train_data, eval_data = split_dataset(data, config.get('train_ratio', 0.9))
    
    def format_prompt(example):
        messages = example['messages']
        text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
        return {"text": text}
    
    train_dataset = Dataset.from_list([format_prompt(ex) for ex in train_data])
    eval_dataset = Dataset.from_list([format_prompt(ex) for ex in eval_data]) if eval_data else None
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        per_device_train_batch_size=config.get('batch_size', 2),
        per_device_eval_batch_size=config.get('batch_size', 2),
        gradient_accumulation_steps=config.get('gradient_accumulation_steps', 4),
        warmup_steps=config.get('warmup_steps', 10),
        num_train_epochs=config.get('num_epochs', 3),
        learning_rate=config.get('learning_rate', 2e-4),
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=config.get('logging_steps', 10),
        optim=config.get('optimizer', "paged_adamw_8bit"),
        weight_decay=config.get('weight_decay', 0.01),
        lr_scheduler_type=config.get('lr_scheduler', "cosine"),
        seed=config.get('seed', 3407),
        save_strategy="steps",
        save_steps=config.get('save_steps', 100),
        evaluation_strategy="steps" if eval_dataset else "no",
        eval_steps=config.get('eval_steps', 100) if eval_dataset else None,
        load_best_model_at_end=True if eval_dataset else False,
        report_to=config.get('report_to', 'none'),
    )
    
    # Trainer
    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        dataset_text_field="text",
        max_seq_length=config.get('max_seq_length', 2048),
        args=training_args,
    )
    
    # Train
    print("📚 Starting training...")
    trainer.train()
    
    # Save
    print(f"💾 Saving model to {output_dir}")
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    
    print("✅ Training complete!")

# ============================================================================
# Method 3: MLX (for Apple Silicon Macs)
# ============================================================================

def finetune_with_mlx(
    model_name: str,
    train_data_path: str,
    output_dir: str,
    config: Dict[str, Any]
):
    """
    Finetune using MLX (optimized for Apple Silicon)
    
    Install: pip install mlx-lm
    """
    try:
        from mlx_lm import load, train
    except ImportError:
        print("Error: MLX not installed. Install with:")
        print("pip install mlx-lm")
        sys.exit(1)
    
    print(f"🍎 Finetuning with MLX: {model_name}")
    
    # Load data
    data = load_jsonl_dataset(train_data_path)
    train_data, eval_data = split_dataset(data, config.get('train_ratio', 0.9))
    
    # Save train and eval sets
    train_path = os.path.join(output_dir, "train.jsonl")
    eval_path = os.path.join(output_dir, "eval.jsonl")
    save_jsonl_dataset(train_data, train_path)
    if eval_data:
        save_jsonl_dataset(eval_data, eval_path)
    
    # MLX training config
    mlx_config = {
        "model": model_name,
        "train": True,
        "data": train_path,
        "valid": eval_path if eval_data else None,
        "adapter-file": os.path.join(output_dir, "adapters.npz"),
        "iters": config.get('iters', 1000),
        "batch-size": config.get('batch_size', 4),
        "learning-rate": config.get('learning_rate', 1e-5),
        "lora-layers": config.get('lora_layers', 16),
        "steps-per-report": config.get('logging_steps', 10),
        "steps-per-eval": config.get('eval_steps', 100) if eval_data else None,
        "save-every": config.get('save_steps', 100),
        "test": False,
        "test-batches": 10,
    }
    
    print(f"📚 Starting MLX training with config: {mlx_config}")
    
    # Run MLX training
    try:
        train.train(**mlx_config)
        print("✅ Training complete!")
        print(f"💾 Adapters saved to {mlx_config['adapter-file']}")
    except Exception as e:
        print(f"❌ Training failed: {e}")
        sys.exit(1)

# ============================================================================
# Method 4: WebLLM Conversion (for browser deployment)
# ============================================================================

def convert_for_webllm(
    model_path: str,
    output_dir: str,
    config: Dict[str, Any]
):
    """
    Convert finetuned model for WebLLM (browser deployment)
    
    Requires: npm install -g @mlc-ai/web-llm
    """
    print(f"🌐 Converting model for WebLLM: {model_path}")
    print("⚠️  This requires @mlc-ai/web-llm CLI tools")
    print("Install: npm install -g @mlc-ai/web-llm")
    print("\nManual steps:")
    print(f"1. mlc_llm convert_weight {model_path} -o {output_dir}")
    print(f"2. mlc_llm gen_config {model_path} --quantization q4f16_1 -o {output_dir}")
    print(f"3. Update console.config.yaml to point to your model")
    print("\nSee: https://mlc.ai/mlc-llm/docs/deploy/webllm.html")

# ============================================================================
# Main
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="Finetune models for Console Homepage AI")
    parser.add_argument("--method", type=str, required=True, 
                       choices=["unsloth", "transformers", "mlx", "webllm"],
                       help="Finetuning method")
    parser.add_argument("--model", type=str, required=True,
                       help="Base model name or path")
    parser.add_argument("--data", type=str, default="training_data.jsonl",
                       help="Training data (JSONL format)")
    parser.add_argument("--output", type=str, default="./finetuned_model",
                       help="Output directory")
    parser.add_argument("--config", type=str, default=None,
                       help="Config JSON file (optional)")
    
    # Common training params
    parser.add_argument("--batch-size", type=int, default=2)
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--lr", type=float, default=2e-4)
    parser.add_argument("--max-seq-length", type=int, default=2048)
    
    args = parser.parse_args()
    
    # Load config
    if args.config and os.path.exists(args.config):
        with open(args.config, 'r') as f:
            config = json.load(f)
    else:
        config = {}
    
    # Override with CLI args
    config.setdefault('batch_size', args.batch_size)
    config.setdefault('num_epochs', args.epochs)
    config.setdefault('learning_rate', args.lr)
    config.setdefault('max_seq_length', args.max_seq_length)
    
    # Create output directory
    os.makedirs(args.output, exist_ok=True)
    
    # Run finetuning
    if args.method == "unsloth":
        finetune_with_unsloth(args.model, args.data, args.output, config)
    elif args.method == "transformers":
        finetune_with_transformers(args.model, args.data, args.output, config)
    elif args.method == "mlx":
        finetune_with_mlx(args.model, args.data, args.output, config)
    elif args.method == "webllm":
        convert_for_webllm(args.model, args.output, config)

if __name__ == "__main__":
    main()
