# Finetuning Package Summary

## 📦 What You Got

A complete finetuning package for your console-style homepage AI, created on **February 1, 2025**.

### Files Created

```
finetuning/
├── training_data.jsonl       # 168 training examples (78KB)
├── finetune.py               # Main finetuning script (16KB)
├── config.json               # Training configuration
├── test_model.py             # Model testing script
├── augment_data.py           # Data augmentation utilities
├── requirements.txt          # Python dependencies
├── quick_start.sh            # One-command setup script
└── README.md                 # Complete documentation (11KB)
```

## 🎯 Training Dataset Statistics

- **Total examples:** 168 conversations
- **Format:** JSONL (OpenAI chat format)
- **Topics covered:**
  - ✅ Research & Publications (30%)
  - ✅ Technical Concepts (25%) 
  - ✅ Tools & Software (20%)
  - ✅ Academic Background (10%)
  - ✅ Personality & Fun (10%)
  - ✅ Practical Info (5%)

### Sample Topics Included

**Research:**
- Artemis (JIT compiler testing)
- MetaMut (LLM-based fuzzing)
- Compilation Space Exploration (CSX)
- Publications at SOSP, ASPLOS, ICSE, FSE, ASE
- Bug findings in HotSpot, OpenJ9, Graal, ART

**Technical:**
- JIT compilers, optimizations, profiling
- Fuzzing, differential testing, oracles
- Bytecode, machine code, VMs
- Compiler flags, inlining, dead code elimination
- Race conditions, concurrency, determinism

**Tools:**
- Artemis, MetaMut, Jigsaw, Rx, SymLang
- LLVM, GCC, HotSpot, Graal, OpenJ9, ART
- V8, JSC, debugging tools

**Personality:**
- Geeky hacker-vibe responses
- Programming jokes and references
- Short, snappy 2-3 sentence answers
- Terminal slang and emoji usage

## 🚀 Quick Start (On Your GPU Machine)

### Method 1: Auto Setup (Recommended)

```bash
cd finetuning/
./quick_start.sh tiny    # Fastest (Qwen 0.5B)
# or
./quick_start.sh small   # SmolLM2 360M
# or
./quick_start.sh medium  # Qwen 1.5B
```

### Method 2: Manual (More Control)

```bash
# Install Unsloth (fastest method)
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
pip install trl datasets

# Finetune
python finetune.py \
  --method unsloth \
  --model Qwen/Qwen2.5-0.5B-Instruct \
  --data training_data.jsonl \
  --output ./my-finetuned-model \
  --batch-size 4 \
  --epochs 5

# Test
python test_model.py ./my-finetuned-model
```

## 💻 Hardware Requirements

| Setup | VRAM | Recommended Model | Training Time |
|-------|------|-------------------|---------------|
| **Consumer GPU** | 8GB | Qwen 0.5B | ~20-30 min |
| **Gaming GPU** | 12GB | Qwen 1.5B | ~1-2 hours |
| **Pro GPU** | 24GB | Gemma 2B | ~2-3 hours |
| **Apple Silicon** | 16GB RAM | Qwen 0.5B (MLX) | ~30-60 min |

### No GPU? Use Free Cloud Options:
- **Google Colab** (Free T4 GPU)
- **Kaggle Notebooks** (Free GPU)
- **Lightning.ai Studio** (Free GPU hours)

## 🎓 Why This Dataset Works

Despite having only **168 examples**, this dataset is effective because:

1. ✅ **Highly focused domain** - Your personal homepage, not general AI
2. ✅ **Consistent personality** - All responses match your geeky style
3. ✅ **Small target models** - 0.5B-2B params adapt quickly
4. ✅ **LoRA finetuning** - Only trains ~1% of parameters
5. ✅ **Quality over quantity** - Each example carefully crafted

Compare to:
- Full pretraining: Trillions of tokens
- Instruction tuning: 100K+ examples  
- **Task-specific adaptation: 100-1,000 examples** ✅ (this dataset)

## 📊 Expected Results

After finetuning on this dataset, your model should:

- ✅ Accurately describe your research (Artemis, MetaMut, etc.)
- ✅ Explain technical concepts (JIT, fuzzing, compilers)
- ✅ Provide correct contact info and links
- ✅ Match the geeky, hacker-vibe personality
- ✅ Suggest relevant slash commands
- ✅ Keep responses short and snappy (2-3 sentences)

## 🔧 Supported Methods

The `finetune.py` script supports **4 methods**:

### 1. Unsloth (Recommended - Fastest)
- 2-5x faster than standard training
- Uses less memory
- Best for NVIDIA GPUs

### 2. Transformers + PEFT
- Standard Hugging Face approach
- More compatible across platforms
- Slightly slower than Unsloth

### 3. MLX (Apple Silicon)
- Optimized for M1/M2/M3 chips
- Uses unified memory efficiently
- Best for Mac users

### 4. WebLLM Conversion
- For browser deployment
- Converts to WebGPU format
- Requires MLC-LLM tools

## 🧪 Testing Your Model

### Automated Test Suite
```bash
python test_model.py ./finetuned-model
```

Tests 11 diverse queries covering:
- Research questions
- Technical explanations
- Tool descriptions
- Personality checks

### Interactive Testing
```bash
python test_model.py ./finetuned-model --interactive
```

Chat with your model live!

### Single Query
```bash
python test_model.py ./finetuned-model --query "Tell me about Artemis"
```

## 📈 Data Augmentation (Optional)

Want more training data? Use the augmentation script:

```bash
python augment_data.py training_data.jsonl \
  --output augmented_data.jsonl \
  --all
```

This can add paraphrases and variations to expand your dataset by 50-100%.

## 🌐 Deploying to Homepage

After finetuning:

1. **Convert to WebLLM format:**
   ```bash
   mlc_llm convert_weight ./finetuned-model \
     --quantization q4f16_1 \
     -o ./webllm-model
   ```

2. **Host model files** (CDN or GitHub Pages)

3. **Update `console.config.yaml`:**
   ```yaml
   ai:
     enabled: true
     model: "your-custom-model-q4f16_1-MLC"
     name: "Pico"
   ```

4. **Deploy!**

See README.md for detailed deployment instructions.

## 📚 Documentation

All details are in **README.md**:
- Complete setup instructions
- Hardware recommendations
- Troubleshooting guide
- Advanced configurations
- Deployment options
- Links to resources

## 🎯 Next Steps

1. **Transfer files** to your GPU machine
2. **Run quick_start.sh** or manual command
3. **Test your model** with test_model.py
4. **Iterate if needed** (add more data, adjust hyperparameters)
5. **Convert for WebLLM** (browser deployment)
6. **Deploy to homepage** and enjoy!

## 💡 Tips for Best Results

- ✅ Start with **Qwen 0.5B** (fastest, good quality)
- ✅ Use **4-5 epochs** for small models
- ✅ Monitor **eval loss** (should be close to train loss)
- ✅ Test with **diverse queries** before deploying
- ✅ If responses are generic, **add more domain-specific examples**
- ✅ If model overfit, **reduce epochs or add dropout**

## 🐛 Common Issues

**Q: Out of memory?**
A: Reduce batch size or use smaller model (SmolLM2-360M)

**Q: Training too slow?**
A: Use Unsloth method or switch to cloud GPU

**Q: Model not learning?**
A: Increase epochs (5-10) or learning rate (5e-4)

**Q: Responses not matching style?**
A: Add more examples with desired personality

## 📞 Support

Questions? Check:
- 📖 README.md (comprehensive guide)
- 💬 Unsloth Discord
- 🤗 Hugging Face Forums
- 📧 Or email: cong.li@inf.ethz.ch

---

**Happy finetuning!** 🚀

The dataset is tailored specifically for your homepage's AI assistant. It captures your research, personality, and use cases. The models listed (Qwen 0.5B, SmolLM2-360M) are small enough to train quickly but capable enough for great results.

Good luck with training on your GPU machine! 🤖✨
