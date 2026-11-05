from fastapi import APIRouter, Depends

from Backend.app.schemas.prediction_schema import SensorReading
from Backend.app.services.database_service import DatabaseService

router = APIRouter(tags=["sensors"])


def get_database() -> DatabaseService:
    return DatabaseService()


@router.post("/sensors")
def create_sensor(reading: SensorReading, database: DatabaseService = Depends(get_database)) -> dict:
    persisted = database.insert_sensor_reading(reading.model_dump())
    return {"status": "success", "persisted": persisted, "data": reading.model_dump()}


@router.get("/sensors")
def list_sensors(database: DatabaseService = Depends(get_database)) -> list[dict]:
    return database.list_rows("sensor_readings")
