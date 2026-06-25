from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from io import BytesIO
from sahi import AutoDetectionModel
from sahi.predict import get_sliced_prediction

app = FastAPI(title="Object Detector", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = AutoDetectionModel.from_pretrained(
    model_type="ultralytics",
    model_path="best.pt",
    confidence_threshold=0.1,
    device="cpu",
)

CLASS_FILTER = {
    "person": ["person"],
    "tank": ["tank"],
    "vehicle": ["vehicle"],
    "aircraft": ["airplane", "helicopter"],
}

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(400, "Only JPEG, PNG, WebP allowed")

    contents = await file.read()
    img = Image.open(BytesIO(contents)).convert("RGB")

    result = get_sliced_prediction(
        image=img,
        detection_model=model,
        slice_height=320,
        slice_width=320,
        overlap_height_ratio=0.4,
        overlap_width_ratio=0.4,
        postprocess_type="NMS",
        postprocess_match_metric="IOU",
        postprocess_match_threshold=0.4,
    )

    detections = []
    for pred in result.object_prediction_list:
        label = pred.category.name
        confidence = float(pred.score.value)
        x1, y1, x2, y2 = pred.bbox.to_xyxy()

        label_lower = label.lower()
        matched = None
        for display_name, model_labels in CLASS_FILTER.items():
            if label_lower in [ml.lower() for ml in model_labels]:
                matched = display_name
                break

        if matched is None:
            continue

        detections.append({
            "label": matched,
            "confidence": round(confidence, 4),
            "x1": round(x1, 1),
            "y1": round(y1, 1),
            "x2": round(x2, 1),
            "y2": round(y2, 1),
        })

    width, height = img.size

    return {
        "success": True,
        "width": width,
        "height": height,
        "detections": detections,
    }


@app.get("/health")
async def health():
    return {"status": "ok", "model": "best.pt (YOLOv8n tank-detection, SAHI)"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
