# Finetuning for Console Homepage AI

This directory contains everything you need to finetune small language models for your console-style homepage AI assistant.

## 📊 Dataset

**`training_data.jsonl`** - 150+ high-quality training examples covering:

- ✅ Conversational responses about Cong Li's research (JIT compilers, fuzzing, LLMs)
- ✅ Technical explanations (compilers, VMs, testing, optimization)
- ✅ Tool descriptions (Artemis, MetaMut, Jigsaw, Rx, etc.)
- ✅ Academic background and publications
- ✅ Personality traits: geeky, hacker-vibe, helpful, witty
- ✅ Command suggestions and navigation
- ✅ Programming concepts and education

**Format:** Each line is a JSON object with a `messages` field containing a conversation in OpenAI chat format:

```json
{
  "messages": [
    {"role": "system", "content": "You are Pico, a geeky AI assistant..."},
    {"role": "user", "content": "What does Cong research?"},
    {"role": "assistant", "content": "Cong's all about compiler testing..."}
  ]
}
```

## 🚀 Quick Start

### Option 1: Unsloth (Recommended - Fastest & Most Efficient)

```bash
# Install dependencies
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
pip install trl datasets

# Finetune Qwen 0.5B (recommended for homepage)
python finetune.py \
  --method unsloth \
  --model Qwen/Qwen2.5-0.5B-Instruct \
  --data training_data.jsonl \
  --output ./finetuned-qwen-0.5b \
  --epochs 5 \
  --batch-size 4
```

### Option 2: Hugging Face Transformers

```bash
# Install dependencies
pip install transformers datasets peft trl bitsandbytes accelerate

# Finetune SmolLM2 360M
python finetune.py \
  --method transformers \
  --model HuggingFaceTB/SmolLM2-360M-Instruct \
  --data training_data.jsonl \
  --output ./finetuned-smollm-360m \
  --epochs 4 \
  --batch-size 4
```

### Option 3: MLX (for Apple Silicon Macs)

```bash
# Install MLX
pip install mlx-lm

# Finetune with MLX
python finetune.py \
  --method mlx \
  --model mlx-community/Qwen2.5-0.5B-Instruct \
  --data training_data.jsonl \
  --output ./finetuned-mlx \
  --batch-size 4
```

## 📝 Configuration

Edit `config.json` to customize training parameters:

```json
{
  "training": {
    "num_epochs": 3,
    "batch_size": 2,
    "learning_rate": 2e-4,
    "max_seq_length": 2048
  },
  "lora": {
    "lora_r": 16,
    "lora_alpha": 16,
    "lora_dropout": 0.05
  }
}
```

Then run with config:

```bash
python finetune.py \
  --method unsloth \
  --model Qwen/Qwen2.5-0.5B-Instruct \
  --config config.json
```

## 🎯 Recommended Models

| Model | Size | Training Time | Best For |
|-------|------|---------------|----------|
| **Qwen2.5-0.5B-Instruct** | ~500MB | ~30 min | Homepage AI (recommended) |
| **SmolLM2-360M-Instruct** | ~360MB | ~20 min | Fastest training |
| **Qwen2.5-1.5B-Instruct** | ~1.5GB | ~1-2 hours | More capable responses |
| **Gemma-2-2B-it** | ~2GB | ~2-3 hours | Best quality |

## 💻 Hardware Requirements

### Minimum Setup (Consumer GPU)
- **GPU:** 8GB VRAM (RTX 3060, RTX 4060, etc.)
- **Recommended model:** Qwen2.5-0.5B or SmolLM2-360M
- **Batch size:** 2-4
- **Training time:** 20-30 minutes

### Recommended Setup (Gaming GPU)
- **GPU:** 12GB+ VRAM (RTX 3080, RTX 4070, etc.)
- **Recommended model:** Qwen2.5-1.5B
- **Batch size:** 4
- **Training time:** 1-2 hours

### Professional Setup
- **GPU:** 24GB+ VRAM (RTX 4090, A100, etc.)
- **Recommended model:** Any
- **Batch size:** 8+
- **Training time:** Variable

### Apple Silicon (M1/M2/M3)
- **RAM:** 16GB+ unified memory
- **Method:** MLX (optimized for Apple GPUs)
- **Recommended model:** Qwen2.5-0.5B or SmolLM2-360M
- **Training time:** 30-60 minutes

### Cloud Options (No GPU)
- **Google Colab** (Free tier has T4 GPU): [Open in Colab](#colab-notebook)
- **Kaggle Notebooks** (Free GPU)
- **Lightning.ai Studio** (Free GPU hours)

## 🔧 Advanced Usage

### Custom Config File

```bash
python finetune.py \
  --method unsloth \
  --model Qwen/Qwen2.5-0.5B-Instruct \
  --config my_config.json
```

### Merge LoRA Weights

To create a single merged model (no adapter needed):

```bash
python finetune.py \
  --method unsloth \
  --model Qwen/Qwen2.5-0.5B-Instruct \
  --output ./output \
  --config config.json

# Edit config.json: "save_merged_model": true
```

### Convert for WebLLM (Browser Deployment)

After finetuning, convert to WebLLM format:

```bash
# Install MLC-LLM
pip install mlc-ai-nightly

# Convert weights
mlc_llm convert_weight ./finetuned-qwen-0.5b \
  --quantization q4f16_1 \
  -o ./webllm-model

# Generate config
mlc_llm gen_config ./finetuned-qwen-0.5b \
  --quantization q4f16_1 \
  --conv-template qwen \
  -o ./webllm-model
```

Then deploy to your homepage - see [WebLLM Deployment Guide](https://mlc.ai/mlc-llm/docs/deploy/webllm.html).

## 📈 Training Tips

### 1. Start Small
Begin with the smallest model (SmolLM2-360M) to verify your setup works.

### 2. Monitor Training
Watch for:
- **Loss should decrease** over time
- **Eval loss** should be close to train loss (not overfitting)
- **GPU memory usage** (adjust batch size if OOM)

### 3. Prevent Overfitting
- Use **train/eval split** (90/10 by default)
- **Don't overtrain** (3-5 epochs usually sufficient)
- Add **dropout** (lora_dropout: 0.05)

### 4. Improve Quality
- **More data** > longer training
- **Diverse examples** covering all use cases
- **Consistent format** and personality
- **Quality over quantity** - review your training examples!

## 🧪 Testing Your Model

After training, test locally:

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Load finetuned model
model = AutoModelForCausalLM.from_pretrained("./finetuned-qwen-0.5b")
tokenizer = AutoTokenizer.from_pretrained("./finetuned-qwen-0.5b")

# Test conversation
messages = [
    {"role": "system", "content": "You are Pico, a geeky AI assistant for Cong Li's homepage."},
    {"role": "user", "content": "Tell me about Artemis"}
]

text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tokenizer(text, return_tensors="pt")

with torch.no_grad():
    outputs = model.generate(**inputs, max_new_tokens=128, temperature=0.8)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    print(response)
```

## 📊 Evaluating Results

### Quantitative Metrics
- **Perplexity:** Lower is better (model confidence)
- **Loss:** Should decrease steadily
- **Eval loss:** Close to train loss (not overfitting)

### Qualitative Testing
Ask your model:
- ✅ "What does Cong research?" (factual accuracy)
- ✅ "Tell me about Artemis" (tool knowledge)
- ✅ "What's a JIT compiler?" (technical explanations)
- ✅ "How can I contact Cong?" (practical info)
- ✅ "Tell me a joke" (personality)

Compare responses to:
1. **Base model** (before finetuning)
2. **Target behavior** (what you want)
3. **Homepage context** (should be consistent)

## 🐛 Troubleshooting

### Out of Memory (OOM)

**Solution 1:** Reduce batch size
```bash
--batch-size 1 --gradient-accumulation-steps 8
```

**Solution 2:** Use smaller model
```bash
--model HuggingFaceTB/SmolLM2-360M-Instruct
```

**Solution 3:** Enable 4-bit quantization (already default)

### Slow Training

**Solution 1:** Use Unsloth (2-5x faster than Transformers)
```bash
--method unsloth
```

**Solution 2:** Reduce max sequence length
```bash
--max-seq-length 1024
```

**Solution 3:** Use GPU, not CPU

### Model Not Learning

**Check:**
- ✅ Loss is decreasing?
- ✅ Learning rate not too low? (try 5e-4)
- ✅ Enough epochs? (try 5-10)
- ✅ Data format correct? (check JSONL)

### Poor Quality Responses

**Fix:**
- 📝 Add more diverse training examples
- 🎯 Ensure consistent personality in data
- 🔄 Try different temperature (0.7-0.9)
- 📊 Increase training epochs (up to 10)

## 🌐 Deploying to Your Homepage

### Method 1: WebLLM (Browser Inference)

1. **Finetune your model** (as above)
2. **Convert to WebLLM** (see Advanced Usage)
3. **Host model files** on CDN or GitHub Pages
4. **Update `console.config.yaml`:**

```yaml
ai:
  enabled: true
  model: "https://your-cdn.com/your-model/mlc-model-params"
  name: "Pico"
  temperature: 0.8
```

### Method 2: API Backend (Server Inference)

1. **Deploy model** to Hugging Face Inference API, vLLM, or FastAPI
2. **Create API wrapper** in `scripts/llm-runner.js`
3. **Update homepage** to call your API

### Method 3: Local Export (Desktop App)

1. **Export to GGUF** format (llama.cpp)
2. **Bundle with Electron** or Tauri
3. **Distribute** as desktop app

## 📚 Resources

### Documentation
- [Unsloth Docs](https://github.com/unslothai/unsloth)
- [PEFT Guide](https://huggingface.co/docs/peft)
- [MLX LM Docs](https://github.com/ml-explore/mlx-examples/tree/main/llms)
- [WebLLM Docs](https://mlc.ai/web-llm/)

### Tutorials
- [LoRA Finetuning Guide](https://huggingface.co/docs/peft/task_guides/clm-lora)
- [Efficient LLM Training](https://huggingface.co/docs/transformers/perf_train_gpu_one)
- [MLC-LLM WebLLM Tutorial](https://mlc.ai/mlc-llm/docs/deploy/webllm.html)

### Community
- [Unsloth Discord](https://discord.gg/unsloth)
- [Hugging Face Forums](https://discuss.huggingface.co/)

## 🎓 Understanding the Dataset

### Data Statistics
- **Total examples:** 150+
- **Avg conversation length:** 3 messages (system + user + assistant)
- **Topics covered:** 20+ domains
- **Style:** Short, snappy responses (2-3 sentences)
- **Personality:** Geeky, hacker-vibe, helpful

### Topic Distribution
- **Research & Publications:** 30%
- **Technical Concepts:** 25%
- **Tools & Software:** 20%
- **Academic Background:** 10%
- **Personality & Fun:** 10%
- **Practical Info:** 5%

### Why This Size Works

**150+ examples is enough because:**
1. ✅ **Focused domain** (Cong Li's research homepage)
2. ✅ **Consistent personality** (not general-purpose AI)
3. ✅ **Small models** adapt quickly (0.5B-2B parameters)
4. ✅ **LoRA finetuning** requires less data than full finetuning
5. ✅ **Quality > Quantity** (carefully crafted examples)

For comparison:
- **Full pretraining:** Trillions of tokens
- **Instruction finetuning:** 100K+ examples
- **Task-specific adaptation:** 100-1,000 examples ✅ (this dataset)

## 🚀 Next Steps

1. **Try the quick start** with Qwen2.5-0.5B
2. **Test your model** with example queries
3. **Iterate on data** if responses need improvement
4. **Deploy to homepage** using WebLLM or API
5. **Share your results!** Open a PR if you improve the dataset

## 📄 License

Training data and scripts are provided for educational and research purposes. The finetuned models inherit the license of their base models:

- **Qwen2.5:** Apache 2.0
- **SmolLM2:** Apache 2.0
- **Gemma-2:** Gemma Terms of Use

---

**Happy finetuning!** 🤖✨

If you have questions, open an issue or reach out to Cong Li at cong.li@inf.ethz.ch
