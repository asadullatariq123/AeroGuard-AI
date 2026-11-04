#!/usr/bin/env python3
"""Train a Remaining Useful Life (RUL) regressor for the FD001 dataset."""

from __future__ import annotations

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

BASE_DIR = Path(__file__).resolve().parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
TRAIN_PATH = PROCESSED_DIR / "fd001_train_prepared.csv"
TEST_PATH = PROCESSED_DIR / "fd001_test_final_prepared.csv"
FEATURES_PATH = PROCESSED_DIR / "feature_columns.json"
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "rul_model.joblib"
METADATA_PATH = MODEL_DIR / "rul_model_metadata.json"
REPORTS_DIR = BASE_DIR / "reports"
TARGET_COLUMN = "rul"


def ensure_prepared_data() -> None:
    """Generate processed CSVs if the training data has not been prepared yet."""
    if TRAIN_PATH.exists() and FEATURES_PATH.exists():
        return

    prepare_script = BASE_DIR / "prepare_fd001.py"
    if not prepare_script.exists():
        raise FileNotFoundError(
            "The data-preparation script is missing. Expected: "
            f"{prepare_script}"
        )

    print("Prepared data not found. Running data pre-processing...")
    subprocess.run([sys.executable, str(prepare_script)], check=True)


def load_feature_columns() -> list[str]:
    with FEATURES_PATH.open("r", encoding="utf-8") as f:
        features = json.load(f)
    return [str(col) for col in features]


def train_model() -> tuple[RandomForestRegressor, dict[str, float]]:
    df = pd.read_csv(TRAIN_PATH)
    feature_columns = load_feature_columns()

    X = df[feature_columns]
    y = df[TARGET_COLUMN]

    X_train, X_valid, y_train, y_valid = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        shuffle=True,
    )

    model = RandomForestRegressor(
        n_estimators=300,
        random_state=42,
        n_jobs=-1,
        max_features="sqrt",
        min_samples_leaf=2,
    )

    model.fit(X_train, y_train)
    predictions = model.predict(X_valid)

    metrics = {
        "mae": mean_absolute_error(y_valid, predictions),
        "rmse": float(np.sqrt(mean_squared_error(y_valid, predictions))),
        "r2": r2_score(y_valid, predictions),
    }

    return model, metrics


def save_reports(model: RandomForestRegressor, validation_metrics: dict[str, float]) -> None:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    test_df = pd.read_csv(TEST_PATH)
    feature_columns = load_feature_columns()
    y_true = test_df[TARGET_COLUMN]
    y_pred = model.predict(test_df[feature_columns])

    prediction_df = pd.DataFrame(
        {
            "engine_id": test_df["engine_id"],
            "cycle": test_df["cycle"],
            "true_rul": y_true,
            "predicted_rul": y_pred,
            "absolute_error": (y_true - y_pred).abs(),
        }
    )
    prediction_df.to_csv(REPORTS_DIR / "fd001_test_predictions.csv", index=False)

    importance_df = pd.DataFrame(
        {
            "feature": feature_columns,
            "importance": model.feature_importances_,
        }
    ).sort_values("importance", ascending=False)
    importance_df.to_csv(REPORTS_DIR / "fd001_feature_importance.csv", index=False)

    test_metrics = {
        "dataset": "FD001",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "model_type": type(model).__name__,
        "n_test_samples": int(len(test_df)),
        "mae": mean_absolute_error(y_true, y_pred),
        "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        "r2": r2_score(y_true, y_pred),
        "validation_mae": validation_metrics["mae"],
        "validation_rmse": validation_metrics["rmse"],
        "validation_r2": validation_metrics["r2"],
        "feature_columns": feature_columns,
    }
    with (REPORTS_DIR / "fd001_metrics.json").open("w", encoding="utf-8") as f:
        json.dump(test_metrics, f, indent=2)

    with (REPORTS_DIR / "fd001_model_summary.json").open("w", encoding="utf-8") as f:
        json.dump(
            {
                "dataset": "FD001",
                "model_path": str(MODEL_PATH),
                "model_type": type(model).__name__,
                "feature_columns": feature_columns,
                "validation_metrics": validation_metrics,
                "test_metrics": {
                    "mae": test_metrics["mae"],
                    "rmse": test_metrics["rmse"],
                    "r2": test_metrics["r2"],
                },
            },
            f,
            indent=2,
        )


def save_model_artifacts(model: RandomForestRegressor, metrics: dict[str, float]) -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    metadata = {
        "target": TARGET_COLUMN,
        "model_type": type(model).__name__,
        "model_path": str(MODEL_PATH),
        "metrics": metrics,
        "training_data": str(TRAIN_PATH),
        "feature_columns": load_feature_columns(),
    }

    with METADATA_PATH.open("w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    save_reports(model, metrics)


def main() -> None:
    ensure_prepared_data()
    model, metrics = train_model()
    save_model_artifacts(model, metrics)

    print(f"Training complete. Model saved to: {MODEL_PATH}")
    print(f"Validation MAE: {metrics['mae']:.4f}")
    print(f"Validation RMSE: {metrics['rmse']:.4f}")
    print(f"Validation R^2: {metrics['r2']:.4f}")
    print(f"Reports saved to: {REPORTS_DIR}")


if __name__ == "__main__":
    main()
