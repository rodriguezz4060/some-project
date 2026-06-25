"""
Lightweight training script for YOLO26 on CPU.
Supports downloading datasets from Roboflow (free API key required).

Usage:
    cd detector
    venv\Scripts\activate
    python train.py --api_key YOUR_ROBOFLOW_KEY
"""

import argparse
import os
import sys
import shutil
import subprocess
from pathlib import Path

ROBOFLOW_DATASETS = {
    "military-vehicles": {
        "workspace": "militaryvehiclerecognition",
        "project": "military-vehicle-recognition",
        "version": 4,
        "classes": ["person", "tank", "armored_vehicle", "military_truck", "artillery", "jeep", "military_personnel", "drone"],
    },
    "aerial-person": {
        "workspace": "aerial-person-detection",
        "project": "aerial-person-detection",
        "version": 1,
        "classes": ["people", "pedestrian", "car", "truck", "bus", "van", "motor", "bicycle", "tricycle", "awning-tricycle"],
    },
}

AVAILABLE_DATASETS = ", ".join(ROBOFLOW_DATASETS)

MODELS = {
    "n": "yolo26n.pt",
    "s": "yolo26s.pt",
    "m": "yolo26m.pt",
}


def ensure_deps():
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "roboflow", "-q"]
    )


def download_roboflow(workspace: str, project: str, version: int, api_key: str) -> str:
    from roboflow import Roboflow

    rf = Roboflow(api_key=api_key)
    project_obj = rf.workspace(workspace).project(project)
    dataset = project_obj.version(version).download("yolov8", location="dataset")

    return dataset.location


def prepare_data_yaml(dataset_path: str, classes: list[str], output: str):
    yaml_content = f"""train: {dataset_path}/train/images
val: {dataset_path}/valid/images

nc: {len(classes)}
names:
"""
    for i, cls in enumerate(classes):
        yaml_content += f"  {i}: {cls}\n"

    with open(output, "w", encoding="utf-8") as f:
        f.write(yaml_content)

    print(f"  Created {output}")


def train(data_yaml: str, model_name: str, epochs: int, batch: int):
    from ultralytics import YOLO

    model = YOLO(model_name)
    print(f"\n{'='*60}")
    print(f"Starting training:")
    print(f"  Model:   {model_name}")
    print(f"  Data:    {data_yaml}")
    print(f"  Epochs:  {epochs}")
    print(f"  Batch:   {batch}")
    print(f"  Device:  cpu")
    print(f"{'='*60}\n")

    model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=640,
        batch=batch,
        device="cpu",
        workers=0,
        patience=20,
        save=True,
        project="runs",
        name="train",
        exist_ok=True,
        pretrained=True,
        optimizer="AdamW",
        lr0=0.001,
        cos_lr=True,
        warmup_epochs=3,
        amp=False,
    )

    best = Path("runs/train/weights/best.pt")
    if best.exists():
        shutil.copy(best, "model.pt")
        print(f"\n✅ Model saved: detector/model.pt")
        print(f"   Replace in main.py:")
        print(f'   model = YOLO("model/model.pt")')


def main():
    parser = argparse.ArgumentParser(description="Lightweight YOLO26 training")
    parser.add_argument("--api_key", help="Roboflow API key (free at app.roboflow.com)")
    parser.add_argument("--dataset", default="military-vehicles", help="Dataset name")
    parser.add_argument("--model", default="n", choices=["n", "s", "m"], help="Model size")
    parser.add_argument("--epochs", type=int, default=50, help="Number of epochs")
    parser.add_argument("--batch", type=int, default=4, help="Batch size (reduce if OOM)")
    args = parser.parse_args()

    print("=" * 60)
    print("YOLO26 Training — Personal Tracker")
    print("=" * 60)
    print(f"Доступні датасети: {AVAILABLE_DATASETS}")
    print()

    if not args.api_key:
        print("\n⚠️  Roboflow API key required!")
        print("   1. Go to https://app.roboflow.com")
        print("   2. Sign up (free, no credit card)")
        print("   3. Go to Settings → API Keys")
        print("   4. Copy your key")
        print(f"\n   Then run:")
        print(f"   python train.py --api_key YOUR_KEY --epochs 50 --batch 4\n")
        return

    ds = ROBOFLOW_DATASETS[args.dataset]

    print(f"\nStep 1/3: Installing dependencies...")
    ensure_deps()

    print(f"\nStep 2/3: Downloading dataset...")
    dataset_path = download_roboflow(
        workspace=ds["workspace"],
        project=ds["project"],
        version=ds["version"],
        api_key=args.api_key,
    )
    print(f"  Dataset saved to: {dataset_path}")

    data_yaml = "data.yaml"
    prepare_data_yaml(dataset_path, ds["classes"], data_yaml)

    print(f"\nStep 3/3: Training...")
    model_file = MODELS[args.model]
    train(data_yaml, model_file, args.epochs, args.batch)


if __name__ == "__main__":
    main()
