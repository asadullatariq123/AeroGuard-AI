def risk_from_rul(predicted_rul: float) -> tuple[float, str]:
    """Temporary agreed baseline until a separately trained failure model is supplied."""
    if predicted_rul <= 20:
        return 0.9, "HIGH"
    if predicted_rul <= 50:
        return 0.6, "MEDIUM"
    return 0.2, "LOW"
