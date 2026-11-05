
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import mean_absolute_error, mean_squared_error

BASE_DIR = Path(__file__).resolve().parents[1]
RESULTS_DIR = BASE_DIR / "results"
MODELS_DIR = BASE_DIR / "models"

MODELS_DIR.mkdir(exist_ok=True)

train = pd.read_csv(RESULTS_DIR / "train_processed.csv")
test = pd.read_csv(RESULTS_DIR / "test_processed.csv")

FEATURES = (
    ["cycle", "setting_1", "setting_2", "setting_3"]
    + [f"sensor_{i}" for i in range(1, 22)]
)

X = train[FEATURES]
y = train["RUL"]
groups = train["engine_id"]

splitter = GroupShuffleSplit(
    n_splits=1,
    test_size=0.2,
    random_state=42
)

train_idx, val_idx = next(
    splitter.split(X, y, groups=groups)
)

X_train = X.iloc[train_idx]
y_train = y.iloc[train_idx]

X_val = X.iloc[val_idx]
y_val = y.iloc[val_idx]

model = RandomForestRegressor(
    n_estimators=150,
    max_depth=15,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

print("Training validation model...")
model.fit(X_train, y_train)

val_predictions = model.predict(X_val)

val_mae = mean_absolute_error(y_val, val_predictions)
val_rmse = np.sqrt(
    mean_squared_error(y_val, val_predictions)
)

print("\nValidation Metrics")
print("MAE:", round(val_mae, 2))
print("RMSE:", round(val_rmse, 2))

print("\nTraining final model...")
final_model = RandomForestRegressor(
    n_estimators=150,
    max_depth=15,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

final_model.fit(X, y)

test_predictions = final_model.predict(test[FEATURES])

test_mae = mean_absolute_error(
    test["RUL"], test_predictions
)

test_rmse = np.sqrt(
    mean_squared_error(test["RUL"], test_predictions)
)

print("\nFD001 Test Metrics")
print("MAE:", round(test_mae, 2))
print("RMSE:", round(test_rmse, 2))

model_path = MODELS_DIR / "aeroguard_rul_model.joblib"

joblib.dump(
    {
        "model": final_model,
        "features": FEATURES
    },
    model_path
)

predictions = test[["engine_id", "RUL"]].copy()
predictions["predicted_RUL"] = np.round(test_predictions, 2)

predictions.to_csv(
    RESULTS_DIR / "predictions.csv",
    index=False
)

print("\nModel saved:", model_path)
print("Predictions saved:", RESULTS_DIR / "predictions.csv")
print("Training completed successfully!")
