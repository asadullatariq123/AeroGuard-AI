# AeroGuard AI Backend

## Setup

From the repository root:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Set `SUPABASE_URL` and `SUPABASE_KEY` in `.env` when Supabase persistence is ready. Do not commit `.env`.

## Run

```powershell
.\.venv\Scripts\python.exe -m uvicorn Backend.app.main:app --reload
```

Open `http://127.0.0.1:8000/docs` for the interactive API documentation.

## Endpoints

- `GET /health`
- `POST /sensors`
- `GET /sensors`
- `POST /predict/rul`
- `POST /predict/failure`
- `GET /predictions`
- `GET /alerts`

Prediction requests use the feature names in `ml/data/processed/feature_columns.json`. Send `cycle`, all required `settings`, and all required `sensors` values. The failure endpoint currently derives a baseline risk level from predicted RUL because no separately trained failure model is present yet.

Supabase table names expected by the adapter are `sensor_readings`, `predictions`, and `maintenance_alerts`. Match their column names to the request and response fields before enabling persistence.
