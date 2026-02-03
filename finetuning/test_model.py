#!/usr/bin/env python3
"""
Test your finetuned model locally before deployment

Usage:
    python test_model.py ./finetuned-qwen-0.5b
    python test_model.py ./finetuned-qwen-0.5b --interactive
"""

import argparse
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

def load_model(model_path: str):
    """Load model and tokenizer"""
    print(f"Loading model from {model_path}...")
    
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        device_map="auto",
        torch_dtype=torch.float16,
    )
    
    print("✅ Model loaded successfully!")
    return model, tokenizer

def generate_response(model, tokenizer, user_message: str, system_prompt: str = None):
    """Generate a response to user message"""
    
    if system_prompt is None:
        system_prompt = "You are Pico, a geeky AI assistant for Cong Li's homepage. Keep responses SHORT and snappy (2-3 sentences), use hacker slang, and be helpful but playful."
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]
    
    # Format with chat template
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(text, return_tensors="pt").to(model.device)
    
    # Generate
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=256,
            temperature=0.8,
            do_sample=True,
            top_p=0.9,
            repetition_penalty=1.1,
        )
    
    # Decode
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract only the assistant's response
    # (remove the input prompt)
    if "<|im_start|>assistant" in response:
        response = response.split("<|im_start|>assistant")[-1]
    elif "assistant\n" in response:
        response = response.split("assistant\n")[-1]
    
    return response.strip()

def run_test_suite(model, tokenizer):
    """Run a suite of test queries"""
    
    test_queries = [
        "Who is Cong Li?",
        "What does Cong research?",
        "Tell me about Artemis",
        "What's compilation space exploration?",
        "Has Cong won any awards?",
        "What's MetaMut?",
        "What conferences has Cong published at?",
        "How can I contact Cong?",
        "What's a JIT compiler?",
        "Why test compilers?",
        "Tell me a joke",
    ]
    
    print("\n" + "="*80)
    print("Running Test Suite")
    print("="*80 + "\n")
    
    for i, query in enumerate(test_queries, 1):
        print(f"[{i}/{len(test_queries)}] User: {query}")
        response = generate_response(model, tokenizer, query)
        print(f"Assistant: {response}\n")
        print("-" * 80 + "\n")

def run_interactive(model, tokenizer):
    """Interactive chat mode"""
    
    print("\n" + "="*80)
    print("Interactive Chat Mode")
    print("="*80)
    print("Type your message and press Enter. Type 'quit' to exit.\n")
    
    while True:
        try:
            user_input = input("You: ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("Goodbye! 👋")
                break
            
            response = generate_response(model, tokenizer, user_input)
            print(f"Assistant: {response}\n")
            
        except KeyboardInterrupt:
            print("\n\nGoodbye! 👋")
            break

def main():
    parser = argparse.ArgumentParser(description="Test finetuned model")
    parser.add_argument("model_path", type=str, help="Path to finetuned model")
    parser.add_argument("--interactive", "-i", action="store_true", help="Interactive chat mode")
    parser.add_argument("--query", "-q", type=str, help="Single query to test")
    
    args = parser.parse_args()
    
    # Load model
    model, tokenizer = load_model(args.model_path)
    
    if args.query:
        # Single query mode
        print(f"\nUser: {args.query}")
        response = generate_response(model, tokenizer, args.query)
        print(f"Assistant: {response}\n")
    
    elif args.interactive:
        # Interactive mode
        run_interactive(model, tokenizer)
    
    else:
        # Test suite mode
        run_test_suite(model, tokenizer)

if __name__ == "__main__":
    main()
