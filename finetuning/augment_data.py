#!/usr/bin/env python3
"""
Data Augmentation Script - Expand your training dataset

This script helps you create more training examples by:
1. Paraphrasing existing examples
2. Adding variations of questions
3. Creating follow-up conversations

Usage:
    python augment_data.py training_data.jsonl --output augmented_data.jsonl
"""

import argparse
import json
import random
from typing import List, Dict, Any

def load_jsonl(file_path: str) -> List[Dict[str, Any]]:
    """Load JSONL file"""
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            data.append(json.loads(line.strip()))
    return data

def save_jsonl(data: List[Dict[str, Any]], file_path: str):
    """Save JSONL file"""
    with open(file_path, 'w', encoding='utf-8') as f:
        for item in data:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')

# Question paraphrases for augmentation
PARAPHRASES = {
    "What does Cong research?": [
        "Tell me about Cong's research",
        "What is Cong working on?",
        "What are Cong's research interests?",
        "What does Cong study?",
    ],
    "Who is Cong Li?": [
        "Tell me about Cong",
        "Who's Cong?",
        "Can you introduce Cong Li?",
    ],
    "Tell me about Artemis": [
        "What's Artemis?",
        "Explain Artemis to me",
        "What is the Artemis project?",
    ],
    "What's a JIT compiler?": [
        "Explain JIT compilers",
        "What does JIT mean?",
        "Tell me about JIT compilation",
    ],
    # Add more paraphrases as needed
}

def create_paraphrase_variations(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Create paraphrased versions of existing examples"""
    augmented = []
    
    for item in data:
        messages = item['messages']
        if len(messages) >= 2 and messages[1]['role'] == 'user':
            user_msg = messages[1]['content']
            
            # Check if we have paraphrases for this question
            if user_msg in PARAPHRASES:
                for paraphrase in PARAPHRASES[user_msg]:
                    new_item = {
                        'messages': [
                            messages[0],  # system
                            {'role': 'user', 'content': paraphrase},
                            messages[2]   # assistant
                        ]
                    }
                    augmented.append(new_item)
    
    return augmented

def create_follow_up_examples(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Create multi-turn conversation examples"""
    augmented = []
    
    # Example follow-ups
    follow_ups = {
        "compiler": [
            {"user": "How does that work?", "response": "explain_more"},
            {"user": "Can you give an example?", "response": "example"},
            {"user": "Why is that important?", "response": "importance"},
        ],
        "paper": [
            {"user": "Where can I read it?", "response": "link_papers"},
            {"user": "What was the impact?", "response": "impact"},
        ],
        "tool": [
            {"user": "Is it open source?", "response": "yes_github"},
            {"user": "Can I try it?", "response": "github_link"},
        ]
    }
    
    # This is simplified - you'd implement proper logic here
    return augmented

def add_noise_variations(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Add examples with typos, capitalization, etc."""
    augmented = []
    
    for item in data:
        messages = item['messages']
        if len(messages) >= 2 and messages[1]['role'] == 'user':
            user_msg = messages[1]['content']
            
            # Lowercase variation
            if not user_msg.islower():
                new_item = {
                    'messages': [
                        messages[0],
                        {'role': 'user', 'content': user_msg.lower()},
                        messages[2]
                    ]
                }
                augmented.append(new_item)
            
            # All caps variation (occasionally)
            if random.random() < 0.1 and not user_msg.isupper():
                new_item = {
                    'messages': [
                        messages[0],
                        {'role': 'user', 'content': user_msg.upper()},
                        messages[2]
                    ]
                }
                augmented.append(new_item)
    
    return augmented

def main():
    parser = argparse.ArgumentParser(description="Augment training data")
    parser.add_argument("input", type=str, help="Input JSONL file")
    parser.add_argument("--output", "-o", type=str, default="augmented_data.jsonl",
                       help="Output JSONL file")
    parser.add_argument("--paraphrase", action="store_true",
                       help="Add paraphrased questions")
    parser.add_argument("--noise", action="store_true",
                       help="Add capitalization/noise variations")
    parser.add_argument("--all", action="store_true",
                       help="Apply all augmentation methods")
    
    args = parser.parse_args()
    
    # Load data
    print(f"📚 Loading data from {args.input}...")
    data = load_jsonl(args.input)
    print(f"   Original: {len(data)} examples")
    
    augmented_data = list(data)  # Start with original data
    
    # Apply augmentations
    if args.all or args.paraphrase:
        print("🔄 Creating paraphrase variations...")
        paraphrased = create_paraphrase_variations(data)
        augmented_data.extend(paraphrased)
        print(f"   Added: {len(paraphrased)} paraphrased examples")
    
    if args.all or args.noise:
        print("🔄 Creating noise variations...")
        noise_variants = add_noise_variations(data)
        augmented_data.extend(noise_variants)
        print(f"   Added: {len(noise_variants)} noise variations")
    
    # Save
    print(f"\n💾 Saving to {args.output}...")
    save_jsonl(augmented_data, args.output)
    print(f"✅ Total: {len(augmented_data)} examples")
    print(f"📈 Increase: +{len(augmented_data) - len(data)} examples ({((len(augmented_data) / len(data)) - 1) * 100:.1f}%)")

if __name__ == "__main__":
    main()
