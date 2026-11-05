from typing import Any

from pydantic import BaseModel, Field


class SensorReading(BaseModel):
    aircraft_id: str | None = None
    component_id: str | None = None
    engine_id: int | str = Field(..., description="FD001 engine/unit identifier")
    cycle: float = Field(..., gt=0)
    settings: dict[str, float] = Field(default_factory=dict)
    sensors: dict[str, float] = Field(default_factory=dict)


class PredictionRequest(SensorReading):
    pass


class PredictionResponse(BaseModel):
    aircraft_id: str | None = None
    component_id: str | None = None
    engine_id: int | str
    failure_probability: float
    risk_level: str
    predicted_rul: float
    status: str = "success"
    persisted: bool = False


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    supabase_configured: bool


class SensorRecord(BaseModel):
    data: dict[str, Any]
