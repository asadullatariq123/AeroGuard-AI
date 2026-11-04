from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]
RAW_DIR = BASE_DIR / "raw"
RESULTS_DIR = BASE_DIR / "results"

RESULTS_DIR.mkdir(exist_ok=True)

columns = (
    ["engine_id", "cycle"]
    + [f"setting_{i}" for i in range(1, 4)]
    + [f"sensor_{i}" for i in range(1, 22)]
)

train = pd.read_csv(
    RAW_DIR / "train_FD001.txt",
    sep=r"\s+",
    header=None,
    names=columns
)

test = pd.read_csv(
    RAW_DIR / "test_FD001.txt",
    sep=r"\s+",
    header=None,
    names=columns
)

rul = pd.read_csv(
    RAW_DIR / "RUL_FD001.txt",
    header=None,
    names=["RUL"]
)

max_cycles = train.groupby("engine_id")["cycle"].max()

train["RUL"] = train["engine_id"].map(max_cycles) - train["cycle"]
train["RUL"] = train["RUL"].clip(upper=125)

test_last = test.loc[
    test.groupby("engine_id")["cycle"].idxmax()
].copy()

test_last = test_last.sort_values("engine_id").reset_index(drop=True)
test_last["RUL"] = rul["RUL"].values

train.to_csv(RESULTS_DIR / "train_processed.csv", index=False)
test_last.to_csv(RESULTS_DIR / "test_processed.csv", index=False)

print("Data preparation completed!")
print("Training rows:", len(train))
print("Testing engines:", len(test_last))
print("Training columns:", len(train.columns))
print("Test RUL values:", len(rul))