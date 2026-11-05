from typing import Any

from Backend.app.config import SUPABASE_KEY, SUPABASE_URL

try:
    from supabase import Client, create_client
except ImportError:
    Client = Any
    create_client = None


class DatabaseService:
    def __init__(self) -> None:
        self.client: Client | None = None
        if SUPABASE_URL and SUPABASE_KEY and create_client:
            self.client = create_client(SUPABASE_URL, SUPABASE_KEY)

    @property
    def configured(self) -> bool:
        return self.client is not None

    def insert_sensor_reading(self, reading: dict[str, Any]) -> bool:
        if not self.client:
            return False
        self.client.table("sensor_readings").insert(reading).execute()
        return True

    def insert_prediction(self, prediction: dict[str, Any]) -> bool:
        if not self.client:
            return False
        self.client.table("predictions").insert(prediction).execute()
        return True

    def list_rows(self, table_name: str, limit: int = 100) -> list[dict[str, Any]]:
        if not self.client:
            return []
        response = self.client.table(table_name).select("*").limit(limit).execute()
        return response.data or []
