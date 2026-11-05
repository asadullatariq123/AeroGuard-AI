from fastapi import FastAPI

from Backend.app.config import MODEL_PATH, SUPABASE_KEY, SUPABASE_URL
from Backend.app.routes.alert_routes import router as alert_router
from Backend.app.routes.prediction_routes import router as prediction_router
from Backend.app.routes.sensor_routes import router as sensor_router
from Backend.app.schemas.prediction_schema import HealthResponse

app = FastAPI(title="AeroGuard AI Backend", version="1.0.0")
app.include_router(sensor_router)
app.include_router(prediction_router)
app.include_router(alert_router)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model_loaded=MODEL_PATH.exists(),
        supabase_configured=bool(SUPABASE_URL and SUPABASE_KEY),
    )
