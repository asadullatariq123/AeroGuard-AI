"""
AeroGuard AI - FastAPI Predictive Maintenance Backend
BUILD DX HACKATHON 2026 - Team Omega
"""

from pathlib import Path
from typing import Dict, Any, List, Optional
import os
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="AeroGuard AI - Aerospace Predictive Maintenance API",
    description="Turbofan RUL Prediction, Anomaly Detection & Fleet Telemetry Service",
    version="1.0.0",
)

# Enable CORS for React Frontend (running on port 3000 or any port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model Loading
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATHS = [
    BASE_DIR.parent / "ml-model" / "models" / "aeroguard_rul_model.joblib",
    BASE_DIR.parent.parent / "AeroGuard-AI" / "AeroGuard-AI" / "ml-model" / "models" / "aeroguard_rul_model.joblib",
    Path("C:/Users/Asad/OneDrive/Desktop/Aerogauard/AeroGuard-AI-Team/ml-model/models/aeroguard_rul_model.joblib"),
]

model_bundle = None
ml_model = None
feature_names = []

for mp in MODEL_PATHS:
    if mp.exists():
        try:
            bundle = joblib.load(mp)
            if isinstance(bundle, dict):
                ml_model = bundle.get("model")
                feature_names = bundle.get("features", [])
            else:
                ml_model = bundle
            if hasattr(ml_model, "n_jobs"):
                ml_model.n_jobs = 1
            model_bundle = bundle
            print(f"[AeroGuard AI] Loaded ML Model successfully from: {mp}")
            break
        except Exception as e:
            print(f"[AeroGuard AI] Warning loading model from {mp}: {e}")

# In-Memory Fleet State
FLEET = [
    {
        "aircraft_id": "AC-101",
        "model": "Airbus A320neo",
        "engine_id": "ENG-101",
        "engine_type": "CFM LEAP-1A",
        "status": "OPERATIONAL",
        "total_cycles": 1420,
        "health_score": 92,
        "predicted_rul": 118,
        "risk_category": "LOW",
        "sensor_values": {
            "temperature": 612.4,
            "vibration": 1.2,
            "pressure": 32.1,
            "exhaust_gas_temp": 640.2,
            "core_speed": 9054.1,
        },
        "last_updated": "2026-11-05T05:00:00Z",
    },
    {
        "aircraft_id": "AC-102",
        "model": "Boeing 737 MAX 8",
        "engine_id": "ENG-102",
        "engine_type": "CFM LEAP-1B",
        "status": "ATTENTION_REQUIRED",
        "total_cycles": 1890,
        "health_score": 38,
        "predicted_rul": 18,
        "risk_category": "HIGH",
        "sensor_values": {
            "temperature": 850.0,
            "vibration": 4.5,
            "pressure": 42.0,
            "exhaust_gas_temp": 880.5,
            "core_speed": 9210.3,
        },
        "last_updated": "2026-11-05T05:15:00Z",
    },
    {
        "aircraft_id": "AC-103",
        "model": "Airbus A350-900",
        "engine_id": "ENG-103",
        "engine_type": "Rolls-Royce Trent XWB",
        "status": "OPERATIONAL",
        "total_cycles": 980,
        "health_score": 85,
        "predicted_rul": 95,
        "risk_category": "LOW",
        "sensor_values": {
            "temperature": 625.0,
            "vibration": 1.4,
            "pressure": 33.5,
            "exhaust_gas_temp": 655.0,
            "core_speed": 9080.0,
        },
        "last_updated": "2026-11-05T05:20:00Z",
    },
    {
        "aircraft_id": "AC-104",
        "model": "Boeing 787-9",
        "engine_id": "ENG-104",
        "engine_type": "GE GEnx-1B",
        "status": "MONITORING",
        "total_cycles": 1650,
        "health_score": 62,
        "predicted_rul": 44,
        "risk_category": "MEDIUM",
        "sensor_values": {
            "temperature": 720.0,
            "vibration": 2.8,
            "pressure": 37.0,
            "exhaust_gas_temp": 750.2,
            "core_speed": 9140.0,
        },
        "last_updated": "2026-11-05T05:25:00Z",
    },
]

ALERTS = [
    {
        "alert_id": "ALT-2026-081",
        "aircraft_id": "AC-102",
        "engine_id": "ENG-102",
        "severity": "CRITICAL",
        "message": "High high-pressure turbine exhaust temperature and abnormal vibration detected on ENG-102.",
        "predicted_rul": 18,
        "risk_category": "HIGH",
        "action_required": "Schedule borescope inspection within 24 flight hours.",
        "timestamp": "2026-11-05T05:15:00Z",
    },
    {
        "alert_id": "ALT-2026-082",
        "aircraft_id": "AC-104",
        "engine_id": "ENG-104",
        "severity": "WARNING",
        "message": "Elevated bypass duct pressure ratio observed on AC-104.",
        "predicted_rul": 44,
        "risk_category": "MEDIUM",
        "action_required": "Monitor sensor trend; inspect bleed valve during upcoming scheduled turnaround.",
        "timestamp": "2026-11-05T05:25:00Z",
    },
]


# Pydantic Schemas
class SensorValues(BaseModel):
    temperature: float = Field(..., description="High Pressure Turbine EGT (deg C)")
    vibration: float = Field(..., description="N2 Core shaft vibration amplitude (mm/s)")
    pressure: float = Field(..., description="Compressor discharge static pressure (psia)")
    cycle: Optional[int] = Field(150, description="Current operating cycle count")


class PredictionRequest(BaseModel):
    aircraft_id: str = Field(..., example="AC-101")
    engine_id: str = Field(..., example="ENG-101")
    sensor_values: Dict[str, float] = Field(
        ...,
        example={"temperature": 850.0, "vibration": 4.5, "pressure": 42.0},
    )


class PredictionResponse(BaseModel):
    aircraft_id: str
    engine_id: str
    predicted_rul: int
    health_score: int
    risk_category: str
    recommendation: str
    explanation: str


class SensorSimulationRequest(BaseModel):
    aircraft_id: str = Field(..., example="AC-102")
    engine_id: str = Field(..., example="ENG-102")
    degradation_factor: float = Field(0.15, description="Factor to degrade sensor health (0.0 to 1.0)")


def compute_rul_inference(sensor_dict: Dict[str, float], cycle: int = 150) -> int:
    """Predicts RUL using the trained Random Forest model or baseline physics formula."""
    temp = sensor_dict.get("temperature", 640.0)
    vib = sensor_dict.get("vibration", 1.5)
    press = sensor_dict.get("pressure", 32.0)

    # If ML model is loaded and full 21 sensors are provided
    if ml_model is not None and feature_names:
        try:
            # Construct feature vector based on CMAPSS features
            row = {feat: 0.0 for feat in feature_names}
            row["cycle"] = float(sensor_dict.get("cycle", cycle))
            row["setting_1"] = float(sensor_dict.get("setting_1", 0.002))
            row["setting_2"] = float(sensor_dict.get("setting_2", 0.0003))
            row["setting_3"] = float(sensor_dict.get("setting_3", 100.0))

            # Map common sensor telemetry to CMAPSS channels
            # sensor_2: Total temp at LPC outlet, sensor_3: Total temp at HPC outlet, sensor_4: Total temp at LPT outlet
            # sensor_7: Total pressure at HPC outlet, sensor_9: Core speed, sensor_11: Static pressure at HPC
            for i in range(1, 22):
                key = f"sensor_{i}"
                if key in sensor_dict:
                    row[key] = float(sensor_dict[key])
                else:
                    # Realistic defaults scaled with temperature/vibration/pressure
                    if i in [2, 3, 4]:
                        row[key] = float(temp) * (0.8 + 0.1 * i)
                    elif i in [7, 8, 11]:
                        row[key] = float(press) * (1.2 + 0.05 * i)
                    elif i in [9, 14]:
                        row[key] = 9000.0 + float(vib) * 50.0
                    else:
                        row[key] = 100.0

            df_input = pd.DataFrame([row])[feature_names]
            predicted = ml_model.predict(df_input)[0]
            return max(1, int(round(predicted)))
        except Exception as ex:
            print(f"[AeroGuard AI] Inference warning: {ex}")

    # Fallback degradation formula
    # Baseline normal RUL is 125 cycles
    degradation = (max(0.0, temp - 600.0) / 3.0) + (max(0.0, vib - 1.0) * 15.0) + (max(0.0, press - 30.0) * 2.0)
    rul = max(5, int(round(125.0 - degradation)))
    return rul


# --- Endpoints ---

@app.get("/", tags=["General"])
def root():
    return {
        "service": "AeroGuard AI API",
        "status": "ONLINE",
        "docs_url": "/docs",
        "api_contract_version": "1.0.0",
        "model_loaded": ml_model is not None,
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint specified in api-contract.md and frontend service."""
    return {
        "status": "ok",
        "service": "AeroGuard AI Backend",
        "model_loaded": ml_model is not None,
        "fleet_count": len(FLEET),
        "alerts_count": len(ALERTS),
    }


@app.get("/api/aircraft", tags=["Fleet"])
@app.get("/api/v1/fleet", tags=["Fleet"])
def get_aircraft_fleet():
    """Returns aircraft fleet telemetry specified in api-contract.md."""
    return FLEET


@app.get("/api/v1/engines/{engine_id}", tags=["Fleet"])
def get_engine_by_id(engine_id: str):
    for ac in FLEET:
        if ac["engine_id"].upper() == engine_id.upper():
            return ac
    raise HTTPException(status_code=404, detail=f"Engine {engine_id} not found")


@app.post("/api/predict", response_model=PredictionResponse, tags=["Prediction"])
@app.post("/api/v1/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict_rul(payload: PredictionRequest):
    """
    Predicts Remaining Useful Life (RUL) and maintenance risk from sensor readings.
    Adheres strictly to the API contract.
    """
    rul = compute_rul_inference(payload.sensor_values)
    health_score = min(100, max(0, int(round((rul / 125.0) * 100.0))))

    if rul < 25:
        risk_category = "HIGH"
        recommendation = "Immediate borescope inspection & turbine overhaul advised."
        explanation = f"Critical sensor metrics: High vibration ({payload.sensor_values.get('vibration', 0)} mm/s) or elevated temperature ({payload.sensor_values.get('temperature', 0)} C) indicating accelerated component wear."
    elif rul < 55:
        risk_category = "MEDIUM"
        recommendation = "Schedule targeted inspection at next turnaround window."
        explanation = "Moderate thermal and acoustic vibration signatures observed. RUL approaching inspection threshold."
    else:
        risk_category = "LOW"
        recommendation = "Continue normal flight envelope operation. Telemetry within nominal parameters."
        explanation = "All monitored turbofan sensors operating within healthy thresholds."

    return PredictionResponse(
        aircraft_id=payload.aircraft_id,
        engine_id=payload.engine_id,
        predicted_rul=rul,
        health_score=health_score,
        risk_category=risk_category,
        recommendation=recommendation,
        explanation=explanation,
    )


@app.get("/api/alerts", tags=["Alerts"])
@app.get("/api/v1/anomalies", tags=["Alerts"])
def get_alerts():
    """Returns active aerospace telemetry alerts specified in api-contract.md."""
    return ALERTS


@app.post("/api/simulate-sensor-update", tags=["Simulation"])
def simulate_sensor_update(payload: SensorSimulationRequest):
    """
    Simulates wear and tear degradation on sensor values, recalculating RUL and updating fleet state.
    """
    target = None
    for ac in FLEET:
        if ac["aircraft_id"].upper() == payload.aircraft_id.upper() or ac["engine_id"].upper() == payload.engine_id.upper():
            target = ac
            break

    if not target:
        raise HTTPException(status_code=404, detail="Aircraft/Engine not found")

    # Apply degradation factor to sensors
    factor = max(0.01, min(1.0, payload.degradation_factor))
    target["sensor_values"]["temperature"] = round(target["sensor_values"]["temperature"] * (1.0 + factor * 0.15), 1)
    target["sensor_values"]["vibration"] = round(target["sensor_values"]["vibration"] * (1.0 + factor * 0.40), 2)
    target["sensor_values"]["pressure"] = round(target["sensor_values"]["pressure"] * (1.0 + factor * 0.10), 1)

    # Recalculate RUL and health
    new_rul = compute_rul_inference(target["sensor_values"])
    target["predicted_rul"] = new_rul
    target["health_score"] = min(100, max(0, int(round((new_rul / 125.0) * 100.0))))

    if new_rul < 25:
        target["risk_category"] = "HIGH"
        target["status"] = "CRITICAL_ALERT"
    elif new_rul < 55:
        target["risk_category"] = "MEDIUM"
        target["status"] = "ATTENTION_REQUIRED"
    else:
        target["risk_category"] = "LOW"
        target["status"] = "OPERATIONAL"

    return {
        "message": f"Sensor update simulated for {target['aircraft_id']} / {target['engine_id']}",
        "updated_state": target,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
