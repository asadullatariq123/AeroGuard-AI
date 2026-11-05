from fastapi import HTTPException


def validate_feature_payload(payload: dict[str, float], feature_columns: list[str]) -> None:
    missing = [feature for feature in feature_columns if feature not in payload]
    if missing:
        raise HTTPException(
            status_code=422,
            detail={"message": "Missing model features", "missing_features": missing},
        )
