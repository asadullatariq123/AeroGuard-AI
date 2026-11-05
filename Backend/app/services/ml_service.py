from pathlib import Path
from typing import Any

import joblib
import pandas as pd
import json

from Backend.app.config import MODEL_PATH


class ModelService:
    def __init__(self, model_path: Path = MODEL_PATH) -> None:
        self.model_path = model_path
        self.bundle = joblib.load(model_path)
        if isinstance(self.bundle, dict) and "model" in self.bundle:
            self.model = self.bundle["model"]
            self.feature_columns = self.bundle.get("feature_columns", [])
        else:
            self.model = self.bundle
            features_path = model_path.parent.parent / "data" / "processed" / "feature_columns.json"
            self.feature_columns = json.loads(features_path.read_text(encoding="utf-8"))

    @property
    def loaded(self) -> bool:
        return self.model is not None and bool(self.feature_columns)

    def predict_rul(self, features: dict[str, float]) -> float:
        frame = pd.DataFrame([[features[name] for name in self.feature_columns]], columns=self.feature_columns)
        return max(0.0, float(self.model.predict(frame)[0]))

    def build_features(self, reading: dict[str, Any]) -> dict[str, float]:
        features = {"cycle": float(reading["cycle"])}
        features.update({str(key): float(value) for key, value in reading.get("settings", {}).items()})
        features.update({str(key): float(value) for key, value in reading.get("sensors", {}).items()})
        return features
