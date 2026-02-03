#!/bin/bash
# Quick start script for finetuning
# Usage: ./quick_start.sh [tiny|small|medium]

set -e

MODEL_SIZE=${1:-tiny}

echo "🚀 Quick Start: Finetuning Console Homepage AI"
echo "================================================"
echo ""

# Detect platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if [[ $(uname -m) == "arm64" ]]; then
        PLATFORM="apple_silicon"
        METHOD="mlx"
        echo "🍎 Detected: Apple Silicon Mac"
        echo "📦 Installing MLX..."
        pip install mlx-lm
    else
        PLATFORM="macos_intel"
        METHOD="transformers"
        echo "🍎 Detected: Intel Mac"
        echo "⚠️  Warning: Training on Intel Mac is slow. Consider using GPU cloud."
    fi
else
    # Linux/Windows
    if command -v nvidia-smi &> /dev/null; then
        PLATFORM="cuda_gpu"
        METHOD="unsloth"
        echo "🐧 Detected: CUDA GPU"
        echo "📦 Installing Unsloth (fastest method)..."
        pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
        pip install trl datasets
    else
        PLATFORM="cpu"
        METHOD="transformers"
        echo "⚠️  No GPU detected. Training will be slow."
        echo "💡 Consider using Google Colab for free GPU."
    fi
fi

# Select model based on size
case $MODEL_SIZE in
    tiny)
        if [[ "$PLATFORM" == "apple_silicon" ]]; then
            MODEL="mlx-community/Qwen2.5-0.5B-Instruct"
        else
            MODEL="Qwen/Qwen2.5-0.5B-Instruct"
        fi
        BATCH_SIZE=4
        EPOCHS=5
        echo "📊 Model: Qwen2.5-0.5B (tiny, fastest)"
        ;;
    small)
        if [[ "$PLATFORM" == "apple_silicon" ]]; then
            MODEL="mlx-community/SmolLM2-360M-Instruct"
        else
            MODEL="HuggingFaceTB/SmolLM2-360M-Instruct"
        fi
        BATCH_SIZE=4
        EPOCHS=4
        echo "📊 Model: SmolLM2-360M (small)"
        ;;
    medium)
        if [[ "$PLATFORM" == "apple_silicon" ]]; then
            MODEL="mlx-community/Qwen2.5-1.5B-Instruct"
        else
            MODEL="Qwen/Qwen2.5-1.5B-Instruct"
        fi
        BATCH_SIZE=2
        EPOCHS=3
        echo "📊 Model: Qwen2.5-1.5B (medium)"
        ;;
    *)
        echo "❌ Invalid size: $MODEL_SIZE"
        echo "Usage: $0 [tiny|small|medium]"
        exit 1
        ;;
esac

echo "🔧 Method: $METHOD"
echo "🎯 Batch size: $BATCH_SIZE"
echo "🔁 Epochs: $EPOCHS"
echo ""

# Create output directory
OUTPUT_DIR="./finetuned-model-$(date +%Y%m%d-%H%M%S)"
echo "📁 Output: $OUTPUT_DIR"
echo ""

# Confirm
read -p "Continue with training? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Check if data exists
if [ ! -f "training_data.jsonl" ]; then
    echo "❌ Error: training_data.jsonl not found!"
    exit 1
fi

# Run training
echo ""
echo "🎓 Starting training..."
echo "⏰ Estimated time: 20-60 minutes"
echo ""

python finetune.py \
    --method $METHOD \
    --model "$MODEL" \
    --data training_data.jsonl \
    --output "$OUTPUT_DIR" \
    --batch-size $BATCH_SIZE \
    --epochs $EPOCHS

echo ""
echo "✅ Training complete!"
echo "📂 Model saved to: $OUTPUT_DIR"
echo ""
echo "🧪 Test your model:"
echo "   python test_model.py $OUTPUT_DIR"
echo ""
echo "🌐 Deploy to homepage:"
echo "   1. Convert to WebLLM (see README.md)"
echo "   2. Update console.config.yaml"
echo "   3. Deploy to GitHub Pages"
echo ""
