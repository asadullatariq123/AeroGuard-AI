from fastapi import APIRouter, Depends

from Backend.app.services.database_service import DatabaseService

router = APIRouter(tags=["alerts"])


def get_database() -> DatabaseService:
    return DatabaseService()


@router.get("/alerts")
def list_alerts(database: DatabaseService = Depends(get_database)) -> list[dict]:
    return database.list_rows("maintenance_alerts")
