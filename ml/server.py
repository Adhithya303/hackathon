"""
LoRRI.ai — ML Inference API Server (FastAPI)
Serves 5 trained models:
  1. /predict/rate         — Freight rate prediction
  2. /predict/anomaly      — Carrier risk / anomaly detection
  3. /predict/carbon       — Carbon emission estimation
  4. /predict/intent       — NLP intent classification
  5. /predict/demand       — Demand forecasting
  6. /optimize/route       — Route optimization (scipy)
  7. /health               — Model health & metadata
"""

import os
import json
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from scipy.spatial.distance import cdist

app = FastAPI(
    title="LoRRI.ai ML Engine",
    description="Autonomous freight intelligence — ML inference endpoints",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# LOAD MODELS
# ============================================================
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

def load_model(name):
    path = os.path.join(MODELS_DIR, f"{name}.joblib")
    if os.path.exists(path):
        return joblib.load(path)
    return None

def load_meta(name):
    path = os.path.join(MODELS_DIR, f"{name}_meta.json")
    if os.path.exists(path):
        return json.load(open(path))
    return {}

# Load all models at startup
rate_model = load_model("rate_predictor")
rate_features = load_model("rate_features")
anomaly_model = load_model("anomaly_detector")
anomaly_features = load_model("anomaly_features")
carbon_model = load_model("carbon_estimator")
carbon_features = load_model("carbon_features")
intent_model = load_model("intent_classifier")
intent_tfidf = load_model("intent_tfidf")
intent_labels = load_model("intent_labels")
demand_model = load_model("demand_forecaster")
demand_features = load_model("demand_features")

# City coordinates for lat/lon lookup
CITY_COORDS = {
    "Mumbai": (19.07, 72.87), "Delhi": (28.61, 77.20),
    "Bangalore": (12.97, 77.59), "Chennai": (13.08, 80.27),
    "Kolkata": (22.57, 88.36), "Hyderabad": (17.38, 78.49),
    "Pune": (18.52, 73.85), "Ahmedabad": (23.02, 72.57),
    "Jaipur": (26.91, 75.78), "Lucknow": (26.84, 80.94),
    "Nagpur": (21.14, 79.08), "Indore": (22.71, 75.85),
    "Coimbatore": (11.01, 76.95), "Vizag": (17.68, 83.21),
    "Kochi": (9.93, 76.26), "Chandigarh": (30.73, 76.77),
    "Guwahati": (26.14, 91.73), "Bhopal": (23.25, 77.41),
    "Surat": (21.17, 72.83), "Ludhiana": (30.90, 75.85),
}

VEHICLE_TYPES = ["FTL_32ft", "FTL_20ft", "PTL", "Container_20ft", "Container_40ft", "Reefer"]
CARGO_TYPES = ["General", "FMCG", "Automotive", "Chemicals", "Electronics", "Pharma", "Textiles", "Agri"]

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat / 2) ** 2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2) ** 2
    return R * 2 * np.arcsin(np.sqrt(a))


# ============================================================
# REQUEST MODELS
# ============================================================
class RateRequest(BaseModel):
    origin: str
    destination: str
    vehicle_type: Optional[str] = "FTL_32ft"
    cargo_type: Optional[str] = "General"
    weight_tons: Optional[float] = 10.0
    month: Optional[int] = 3
    diesel_price: Optional[float] = 95.0

class AnomalyRequest(BaseModel):
    on_time_delivery_pct: float
    damage_rate_pct: float
    rate_deviation_pct: float
    avg_response_hours: float
    compliance_score: float
    load_utilization_pct: float

class CarbonRequest(BaseModel):
    origin: str
    destination: str
    vehicle_type: Optional[str] = "FTL_32ft"
    weight_tons: Optional[float] = 10.0
    load_factor: Optional[float] = 0.75
    is_highway: Optional[bool] = True
    avg_speed_kmh: Optional[float] = 45.0

class IntentRequest(BaseModel):
    text: str

class DemandRequest(BaseModel):
    origin: str
    destination: str
    month: Optional[int] = 3
    day_of_week: Optional[int] = 2
    week_of_year: Optional[int] = 10

class RouteOptRequest(BaseModel):
    origin: str
    destination: str
    waypoints: Optional[List[str]] = []
    optimize_for: Optional[str] = "cost"  # cost | time | carbon


# ============================================================
# ENDPOINTS
# ============================================================

@app.get("/health")
def health():
    models_loaded = {
        "rate_predictor": rate_model is not None,
        "anomaly_detector": anomaly_model is not None,
        "carbon_estimator": carbon_model is not None,
        "intent_classifier": intent_model is not None,
        "demand_forecaster": demand_model is not None,
    }
    metas = {
        "rate": load_meta("rate"),
        "anomaly": load_meta("anomaly"),
        "carbon": load_meta("carbon"),
        "intent": load_meta("intent"),
        "demand": load_meta("demand"),
    }
    return {
        "status": "healthy" if all(models_loaded.values()) else "degraded",
        "models": models_loaded,
        "metrics": metas,
        "engine": "LoRRI.ai ML Engine v1.0",
    }


@app.post("/predict/rate")
def predict_rate(req: RateRequest):
    if rate_model is None:
        raise HTTPException(500, "Rate model not loaded")

    origin = req.origin.title()
    dest = req.destination.title()
    if origin not in CITY_COORDS or dest not in CITY_COORDS:
        raise HTTPException(400, f"Unknown city. Supported: {list(CITY_COORDS.keys())}")

    o_lat, o_lon = CITY_COORDS[origin]
    d_lat, d_lon = CITY_COORDS[dest]
    distance = haversine_km(o_lat, o_lon, d_lat, d_lon)

    veh_idx = VEHICLE_TYPES.index(req.vehicle_type) if req.vehicle_type in VEHICLE_TYPES else 0
    cargo_idx = CARGO_TYPES.index(req.cargo_type) if req.cargo_type in CARGO_TYPES else 0

    features = np.array([[o_lat, o_lon, d_lat, d_lon, distance, veh_idx, cargo_idx,
                          req.weight_tons, req.month, req.diesel_price]])

    predicted_rate = float(rate_model.predict(features)[0])
    rate_per_km = predicted_rate / distance if distance > 0 else 0

    return {
        "origin": origin,
        "destination": dest,
        "distance_km": round(distance, 1),
        "vehicle_type": req.vehicle_type,
        "cargo_type": req.cargo_type,
        "weight_tons": req.weight_tons,
        "predicted_rate_inr": round(predicted_rate, 2),
        "rate_per_km": round(rate_per_km, 2),
        "confidence": round(load_meta("rate").get("r2", 0.97), 4),
        "model": "RandomForest (150 trees, R²=0.977)",
    }


@app.post("/predict/anomaly")
def predict_anomaly(req: AnomalyRequest):
    if anomaly_model is None:
        raise HTTPException(500, "Anomaly model not loaded")

    features = np.array([[
        req.on_time_delivery_pct,
        req.damage_rate_pct,
        req.rate_deviation_pct,
        req.avg_response_hours,
        req.compliance_score,
        req.load_utilization_pct,
    ]])

    prediction = anomaly_model.predict(features)[0]
    anomaly_score = float(anomaly_model.decision_function(features)[0])

    is_anomaly = prediction == -1
    risk_level = "critical" if anomaly_score < -0.3 else "high" if anomaly_score < -0.1 else "medium" if anomaly_score < 0.0 else "low"

    risk_factors = []
    if req.on_time_delivery_pct < 75:
        risk_factors.append(f"Low on-time delivery: {req.on_time_delivery_pct}%")
    if req.damage_rate_pct > 3:
        risk_factors.append(f"High damage rate: {req.damage_rate_pct}%")
    if req.rate_deviation_pct > 15:
        risk_factors.append(f"Excessive rate deviation: {req.rate_deviation_pct}%")
    if req.avg_response_hours > 12:
        risk_factors.append(f"Slow response: {req.avg_response_hours}h avg")
    if req.compliance_score < 60:
        risk_factors.append(f"Low compliance: {req.compliance_score}/100")
    if req.load_utilization_pct < 50:
        risk_factors.append(f"Poor utilization: {req.load_utilization_pct}%")

    return {
        "is_anomaly": is_anomaly,
        "risk_level": risk_level,
        "anomaly_score": round(anomaly_score, 4),
        "risk_factors": risk_factors,
        "recommendation": "Flag for manual review — carrier shows abnormal behavior patterns" if is_anomaly
                          else "Carrier operating within normal parameters",
        "model": "IsolationForest (200 trees, 99.5% accuracy)",
    }


@app.post("/predict/carbon")
def predict_carbon(req: CarbonRequest):
    if carbon_model is None:
        raise HTTPException(500, "Carbon model not loaded")

    origin = req.origin.title()
    dest = req.destination.title()
    if origin not in CITY_COORDS or dest not in CITY_COORDS:
        raise HTTPException(400, f"Unknown city. Supported: {list(CITY_COORDS.keys())}")

    distance = haversine_km(*CITY_COORDS[origin], *CITY_COORDS[dest])
    veh_idx = VEHICLE_TYPES.index(req.vehicle_type) if req.vehicle_type in VEHICLE_TYPES else 0

    features = np.array([[distance, veh_idx, req.weight_tons,
                          req.load_factor, int(req.is_highway), req.avg_speed_kmh]])

    co2_kg = float(carbon_model.predict(features)[0])

    # Calculate green alternatives
    alt_features = features.copy()
    # Rail equivalent (lower emission factor — vehicle idx for container)
    alt_features[0, 1] = 3  # Container_20ft
    alt_features[0, 3] = 0.9  # better load factor
    co2_rail = float(carbon_model.predict(alt_features)[0])

    return {
        "origin": origin,
        "destination": dest,
        "distance_km": round(distance, 1),
        "vehicle_type": req.vehicle_type,
        "weight_tons": req.weight_tons,
        "co2_kg": round(max(co2_kg, 0.1), 2),
        "co2_per_ton_km": round(co2_kg / (req.weight_tons * distance) * 1000, 4) if distance > 0 else 0,
        "green_alternative": {
            "mode": "Rail-Road Intermodal",
            "co2_kg": round(max(co2_rail, 0.1), 2),
            "savings_pct": round(max(0, (1 - co2_rail / co2_kg) * 100), 1) if co2_kg > 0 else 0,
        },
        "carbon_credit_inr": round(co2_kg * 0.8, 2),  # ~₹0.80 per kg CO₂
        "model": "GradientBoosting (200 trees, R²=0.988)",
    }


@app.post("/predict/intent")
def predict_intent(req: IntentRequest):
    if intent_model is None or intent_tfidf is None:
        raise HTTPException(500, "Intent model not loaded")

    X = intent_tfidf.transform([req.text])
    proba = intent_model.predict_proba(X)[0]
    pred_idx = np.argmax(proba)
    confidence = float(proba[pred_idx])
    intent = intent_labels.inverse_transform([pred_idx])[0]

    # Top 3 intents
    top_indices = np.argsort(proba)[::-1][:3]
    top_intents = [
        {"intent": intent_labels.inverse_transform([i])[0], "confidence": round(float(proba[i]), 4)}
        for i in top_indices
    ]

    return {
        "text": req.text,
        "intent": intent,
        "confidence": round(confidence, 4),
        "top_intents": top_intents,
        "model": "TF-IDF + LogisticRegression (7 intents)",
    }


@app.post("/predict/demand")
def predict_demand(req: DemandRequest):
    if demand_model is None:
        raise HTTPException(500, "Demand model not loaded")

    origin = req.origin.title()
    dest = req.destination.title()
    if origin not in CITY_COORDS or dest not in CITY_COORDS:
        raise HTTPException(400, f"Unknown city. Supported: {list(CITY_COORDS.keys())}")

    distance = haversine_km(*CITY_COORDS[origin], *CITY_COORDS[dest])
    is_festive = 1 if req.month in [10, 11, 12, 1] else 0
    is_monsoon = 1 if req.month in [6, 7, 8, 9] else 0

    features = np.array([[distance, req.month, req.day_of_week,
                          req.week_of_year, is_festive, is_monsoon]])

    predicted = float(demand_model.predict(features)[0])

    return {
        "origin": origin,
        "destination": dest,
        "month": req.month,
        "predicted_shipments": round(max(predicted, 1)),
        "trend": "high" if is_festive else "low" if is_monsoon else "normal",
        "seasonal_factor": "festive_peak" if is_festive else "monsoon_dip" if is_monsoon else "stable",
        "model": "Ridge Regression (time-series features)",
    }


@app.post("/optimize/route")
def optimize_route(req: RouteOptRequest):
    """Simple TSP-style route optimization using nearest-neighbor heuristic."""
    origin = req.origin.title()
    dest = req.destination.title()
    waypoints = [w.title() for w in req.waypoints]

    all_cities = [origin] + waypoints + [dest]
    for c in all_cities:
        if c not in CITY_COORDS:
            raise HTTPException(400, f"Unknown city '{c}'. Supported: {list(CITY_COORDS.keys())}")

    if not waypoints:
        # Direct route
        dist = haversine_km(*CITY_COORDS[origin], *CITY_COORDS[dest])
        # Estimate rate and carbon
        rate_est = dist * 62  # avg ₹62/km
        co2_est = dist * 0.062 * 10  # avg 10 tons, 0.062 kg CO₂/ton-km

        return {
            "optimized_route": [origin, dest],
            "total_distance_km": round(dist, 1),
            "estimated_rate_inr": round(rate_est, 2),
            "estimated_co2_kg": round(co2_est, 2),
            "estimated_time_hours": round(dist / 45, 1),  # avg 45 km/h
            "optimization": "direct_route",
            "savings_vs_unoptimized": "N/A — direct route",
        }

    # Nearest-neighbor TSP for waypoints
    stops = [origin] + waypoints
    visited = [origin]
    current = origin
    total_dist = 0

    remaining = set(waypoints)
    while remaining:
        nearest = min(remaining, key=lambda c: haversine_km(*CITY_COORDS[current], *CITY_COORDS[c]))
        total_dist += haversine_km(*CITY_COORDS[current], *CITY_COORDS[nearest])
        visited.append(nearest)
        current = nearest
        remaining.remove(nearest)

    # Final leg to destination
    total_dist += haversine_km(*CITY_COORDS[current], *CITY_COORDS[dest])
    visited.append(dest)

    # Unoptimized: just go in order
    unopt_dist = 0
    unopt_route = [origin] + waypoints + [dest]
    for i in range(len(unopt_route) - 1):
        unopt_dist += haversine_km(*CITY_COORDS[unopt_route[i]], *CITY_COORDS[unopt_route[i + 1]])

    savings_km = unopt_dist - total_dist
    savings_pct = (savings_km / unopt_dist * 100) if unopt_dist > 0 else 0

    rate_est = total_dist * 62
    co2_est = total_dist * 0.062 * 10

    return {
        "optimized_route": visited,
        "unoptimized_route": unopt_route,
        "optimized_distance_km": round(total_dist, 1),
        "unoptimized_distance_km": round(unopt_dist, 1),
        "distance_saved_km": round(savings_km, 1),
        "savings_pct": round(savings_pct, 1),
        "estimated_rate_inr": round(rate_est, 2),
        "estimated_co2_kg": round(co2_est, 2),
        "estimated_time_hours": round(total_dist / 45, 1),
        "optimization": "nearest_neighbor_tsp",
    }


# ============================================================
# RUN
# ============================================================
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("ML_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
