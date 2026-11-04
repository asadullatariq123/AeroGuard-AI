from __future__ import annotations

import os
from typing import Any

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()


def get_supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SECRET_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be configured")
    return create_client(url, key)


def save_sensor_readings(
    readings: dict[str, Any] | list[dict[str, Any]],
    client: Client | None = None,
) -> list[dict[str, Any]]:
    rows = readings if isinstance(readings, list) else [readings]
    response = (client or get_supabase_client()).table("sensor_readings").insert(rows).execute()
    return response.data or []


def save_prediction(
    prediction: dict[str, Any],
    client: Client | None = None,
) -> dict[str, Any] | None:
    response = (client or get_supabase_client()).table("predictions").insert(prediction).execute()
    return response.data[0] if response.data else None


def get_component_readings(
    component_id: str,
    limit: int = 100,
    client: Client | None = None,
) -> list[dict[str, Any]]:
    response = (
        (client or get_supabase_client())
        .table("sensor_readings")
        .select("*")
        .eq("component_id", component_id)
        .order("recorded_at", desc=True)
        .limit(limit)
        .execute()
    )
    return response.data or []


def get_component_predictions(
    component_id: str,
    limit: int = 100,
    client: Client | None = None,
) -> list[dict[str, Any]]:
    response = (
        (client or get_supabase_client())
        .table("predictions")
        .select("*")
        .eq("component_id", component_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return response.data or []