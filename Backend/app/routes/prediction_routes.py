from fastapi import APIRouter, Depends, HTTPException

from Backend.app.schemas.prediction_schema import PredictionRequest, PredictionResponse
from Backend.app.services.alert_service import risk_from_rul
from Backend.app.services.database_service import DatabaseService
from Backend.app.services.ml_service import ModelService
from Backend.app.utils.validation import validate_feature_payload

router = APIRouter(tags=["predictions"])


def get_model() -> ModelService:
    try:
        return ModelService()
    except (FileNotFoundError, OSError, ValueError) as exc:
        raise HTTPException(status_code=503, detail=f"ML model unavailable: {exc}") from exc


def get_database() -> DatabaseService:
    return DatabaseService()


def make_prediction(
    request: PredictionRequest,
    model: ModelService,
    database: DatabaseService,
) -> PredictionResponse:
    features = model.build_features(request.model_dump())
    validate_feature_payload(features, model.feature_columns)
    predicted_rul = model.predict_rul(features)
    failure_probability, risk_level = risk_from_rul(predicted_rul)
    prediction = {
        "aircraft_id": request.aircraft_id,
        "component_id": request.component_id,
        "engine_id": str(request.engine_id),
        "failure_probability": failure_probability,
        "risk_level": risk_level,
        "predicted_rul": predicted_rul,
    }
    persisted = database.insert_prediction(prediction)
    return PredictionResponse(
        **prediction,
        persisted=persisted,
    )


@router.post("/predict/rul", response_model=PredictionResponse)
def predict_rul(
    request: PredictionRequest,
    model: ModelService = Depends(get_model),
    database: DatabaseService = Depends(get_database),
) -> PredictionResponse:
    return make_prediction(request, model, database)


@router.post("/predict/failure", response_model=PredictionResponse)
def predict_failure(
    request: PredictionRequest,
    model: ModelService = Depends(get_model),
    database: DatabaseService = Depends(get_database),
) -> PredictionResponse:
    return make_prediction(request, model, database)


@router.get("/predictions")
def list_predictions(database: DatabaseService = Depends(get_database)) -> list[dict]:
    return database.list_rows("predictions")
