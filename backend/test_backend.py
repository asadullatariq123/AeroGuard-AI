"""
AeroGuard AI - Backend Automated Validation Test
Tests all endpoints from api-contract.md directly using FastAPI TestClient.
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True
    print("[PASS] GET /health ->", data)

def test_get_aircraft():
    response = client.get("/api/aircraft")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4
    assert any(a["aircraft_id"] == "AC-101" for a in data)
    print(f"[PASS] GET /api/aircraft -> {len(data)} aircraft returned.")

def test_predict_nominal():
    payload = {
        "aircraft_id": "AC-101",
        "engine_id": "ENG-101",
        "sensor_values": {
            "temperature": 610.0,
            "vibration": 1.1,
            "pressure": 32.0
        }
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["aircraft_id"] == "AC-101"
    assert "predicted_rul" in data
    assert "health_score" in data
    assert data["risk_category"] in ["LOW", "MEDIUM", "HIGH"]
    print(f"[PASS] POST /api/predict (Nominal) -> RUL: {data['predicted_rul']}, Risk: {data['risk_category']}")

def test_predict_degraded():
    # Exactly matching sample from api-contract.md
    payload = {
        "aircraft_id": "AC-101",
        "engine_id": "ENG-101",
        "sensor_values": {
            "temperature": 850,
            "vibration": 4.5,
            "pressure": 42
        }
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["aircraft_id"] == "AC-101"
    assert data["risk_category"] == "HIGH"
    print(f"[PASS] POST /api/predict (Degraded/High Risk) -> RUL: {data['predicted_rul']}, Risk: {data['risk_category']}, Rec: {data['recommendation']}")

def test_alerts():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    print(f"[PASS] GET /api/alerts -> {len(data)} active alerts.")

def test_sensor_simulation():
    payload = {
        "aircraft_id": "AC-102",
        "engine_id": "ENG-102",
        "degradation_factor": 0.2
    }
    response = client.post("/api/simulate-sensor-update", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "updated_state" in data
    assert data["updated_state"]["aircraft_id"] == "AC-102"
    print(f"[PASS] POST /api/simulate-sensor-update -> {data['message']}")

if __name__ == "__main__":
    print("=" * 60)
    print("AeroGuard AI - Backend Validation Suite")
    print("=" * 60)
    test_health()
    test_get_aircraft()
    test_predict_nominal()
    test_predict_degraded()
    test_alerts()
    test_sensor_simulation()
    print("=" * 60)
    print("ALL 6 TESTS PASSED!")
    print("=" * 60)

