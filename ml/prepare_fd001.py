import json
from pathlib import Path
import pandas as pd

RUL_CAP = 125

INDEX_COLUMNS = ["engine_id", "cycle"]
SETTING_COLUMNS = ["setting_1", "setting_2", "setting_3"]
SENSOR_COLUMNS = [f"sensor_{i}" for i in range(1, 22)]
ALL_COLUMNS = INDEX_COLUMNS + SETTING_COLUMNS + SENSOR_COLUMNS
CANDIDATE_FEATURES = ["cycle"] + SETTING_COLUMNS + SENSOR_COLUMNS


def load_cmapss_file(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path, sep=r"\s+", header=None, names=ALL_COLUMNS)
    return df


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    raw_dir = base_dir / "data" / "raw"
    processed_dir = base_dir / "data" / "processed"
    processed_dir.mkdir(parents=True, exist_ok=True)

    train_path = raw_dir / "train_FD001.txt"
    test_path = raw_dir / "test_FD001.txt"
    rul_path = raw_dir / "RUL_FD001.txt"

    # 1. Read the NASA dataset
    train_df = load_cmapss_file(train_path)
    test_df = load_cmapss_file(test_path)
    rul_df = pd.read_csv(rul_path, sep=r"\s+", header=None, names=["true_rul"])

    # 2 & 3. Identify individual engines and calculate Remaining Useful Life (RUL) for training records
    max_cycles = train_df.groupby("engine_id")["cycle"].transform("max")
    train_df["rul_raw"] = max_cycles - train_df["cycle"]

    # 4. Cap training RUL labels at 125 cycles
    train_df["rul"] = train_df["rul_raw"].clip(upper=RUL_CAP)

    # 5. Remove constant input features (zero or near-zero variance across training set)
    varying_features = [
        col for col in CANDIDATE_FEATURES if train_df[col].nunique(dropna=False) > 1 and train_df[col].std() > 1e-6
    ]
    dropped_features = [col for col in CANDIDATE_FEATURES if col not in varying_features]

    # 6. Prepare the final test record for each test engine using the official RUL labels
    test_final_df = (
        test_df.sort_values(["engine_id", "cycle"])
        .groupby("engine_id", as_index=False)
        .last()
        .sort_values("engine_id")
        .reset_index(drop=True)
    )
    test_final_df["rul_raw"] = rul_df["true_rul"].values
    test_final_df["rul"] = test_final_df["rul_raw"].clip(upper=RUL_CAP)

    # Keep identifier columns, varying features, and RUL labels
    keep_cols = ["engine_id"] + (["cycle"] if "cycle" not in varying_features else []) + varying_features + ["rul_raw", "rul"]
    # Ensure no duplicate column names while preserving order
    keep_cols = list(dict.fromkeys(keep_cols))

    train_prepared = train_df[keep_cols]
    test_final_prepared = test_final_df[keep_cols]

    # Save processed CSVs
    train_out = processed_dir / "fd001_train_prepared.csv"
    test_out = processed_dir / "fd001_test_final_prepared.csv"
    features_out = processed_dir / "feature_columns.json"
    metadata_out = processed_dir / "preprocessing_metadata.json"

    train_prepared.to_csv(train_out, index=False)
    test_final_prepared.to_csv(test_out, index=False)

    with open(features_out, "w", encoding="utf-8") as f:
        json.dump(varying_features, f, indent=2)

    metadata = {
        "dataset": "FD001",
        "rul_cap": RUL_CAP,
        "train_rows": int(len(train_prepared)),
        "train_engines": int(train_prepared["engine_id"].nunique()),
        "test_engines": int(len(test_final_prepared)),
        "retained_feature_count": len(varying_features),
        "retained_features": varying_features,
        "dropped_constant_features": dropped_features,
    }
    with open(metadata_out, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"Prepared {len(train_prepared)} training rows and {len(test_final_prepared)} final test-engine rows.")
    print(f"Retained {len(varying_features)} varying features.")
    print(f"Output: {processed_dir}")


if __name__ == "__main__":
    main()

