"""
LoRRI.ai — ML Model Training Pipeline
Trains 5 production ML models on synthetic Indian freight data:
  1. Freight Rate Predictor (Random Forest Regressor)
  2. Anomaly / Risk Detector (Isolation Forest)
  3. Carbon Emission Estimator (Gradient Boosting Regressor)
  4. NLP Intent Classifier (TF-IDF + Logistic Regression)
  5. Demand Forecaster (Ridge Regression with time features)
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import (
    RandomForestRegressor,
    IsolationForest,
    GradientBoostingRegressor,
)
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score, accuracy_score
from sklearn.preprocessing import LabelEncoder

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

np.random.seed(42)

# ============================================================
# INDIAN FREIGHT DOMAIN CONSTANTS
# ============================================================
CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata",
    "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
    "Nagpur", "Indore", "Coimbatore", "Vizag", "Kochi",
    "Chandigarh", "Guwahati", "Bhopal", "Surat", "Ludhiana",
]

# Approximate distances (km) between major Indian city pairs
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
    """Haversine distance in km."""
    R = 6371
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat / 2) ** 2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2) ** 2
    return R * 2 * np.arcsin(np.sqrt(a))


# ============================================================
# 1. FREIGHT RATE PREDICTION MODEL
# ============================================================
def generate_freight_data(n=15000):
    """Generate synthetic but realistic Indian freight rate data."""
    records = []
    for _ in range(n):
        origin = np.random.choice(CITIES)
        dest = np.random.choice([c for c in CITIES if c != origin])
        o_lat, o_lon = CITY_COORDS[origin]
        d_lat, d_lon = CITY_COORDS[dest]
        distance = haversine_km(o_lat, o_lon, d_lat, d_lon)

        vehicle = np.random.choice(VEHICLE_TYPES)
        cargo = np.random.choice(CARGO_TYPES)
        weight_tons = np.random.uniform(1, 25)
        month = np.random.randint(1, 13)
        diesel_price = np.random.uniform(85, 110)  # ₹/litre range

        # Vehicle multiplier
        veh_mult = {"FTL_32ft": 1.0, "FTL_20ft": 0.72, "PTL": 0.45,
                     "Container_20ft": 1.15, "Container_40ft": 1.55, "Reefer": 1.8}[vehicle]

        # Cargo risk multiplier
        cargo_mult = {"General": 1.0, "FMCG": 1.05, "Automotive": 1.12, "Chemicals": 1.25,
                       "Electronics": 1.18, "Pharma": 1.35, "Textiles": 0.95, "Agri": 0.88}[cargo]

        # Seasonal factor (peak Oct-Dec, lean Apr-Jun)
        season = 1.0 + 0.08 * np.sin(2 * np.pi * (month - 3) / 12)

        # Base rate: ₹/km pricing with distance, diesel, weight factors
        base_rate_per_km = (38 + 0.3 * diesel_price + 0.5 * weight_tons) * veh_mult * cargo_mult * season
        total_rate = base_rate_per_km * distance * (1 + np.random.normal(0, 0.06))

        # Ensure minimum ₹3000
        total_rate = max(total_rate, 3000)

        records.append({
            "origin_lat": o_lat, "origin_lon": o_lon,
            "dest_lat": d_lat, "dest_lon": d_lon,
            "distance_km": distance,
            "vehicle_type": VEHICLE_TYPES.index(vehicle),
            "cargo_type": CARGO_TYPES.index(cargo),
            "weight_tons": weight_tons,
            "month": month,
            "diesel_price": diesel_price,
            "rate_inr": round(total_rate, 2),
        })

    return pd.DataFrame(records)


def train_rate_predictor():
    print("=" * 60)
    print("1. TRAINING FREIGHT RATE PREDICTION MODEL")
    print("=" * 60)

    df = generate_freight_data(15000)
    features = ["origin_lat", "origin_lon", "dest_lat", "dest_lon",
                "distance_km", "vehicle_type", "cargo_type",
                "weight_tons", "month", "diesel_price"]
    X = df[features]
    y = df["rate_inr"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=18,
        min_samples_split=5,
        min_samples_leaf=3,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"  Samples: {len(df)}")
    print(f"  MAE: ₹{mae:,.0f}")
    print(f"  R² Score: {r2:.4f}")
    print(f"  Feature Importance: {dict(zip(features, model.feature_importances_.round(3)))}")

    joblib.dump(model, os.path.join(MODELS_DIR, "rate_predictor.joblib"))
    joblib.dump(features, os.path.join(MODELS_DIR, "rate_features.joblib"))

    # Save metadata
    meta = {"mae": round(mae, 2), "r2": round(r2, 4), "samples": len(df), "features": features}
    json.dump(meta, open(os.path.join(MODELS_DIR, "rate_meta.json"), "w"))
    print("  ✓ Saved rate_predictor.joblib\n")
    return model


# ============================================================
# 2. ANOMALY / RISK DETECTION MODEL
# ============================================================
def generate_carrier_data(n=8000):
    """Generate carrier behavior data with injected anomalies."""
    records = []
    for i in range(n):
        is_anomaly = np.random.random() < 0.08  # ~8% anomaly rate

        if is_anomaly:
            on_time_pct = np.random.uniform(30, 65)
            damage_rate = np.random.uniform(3, 12)
            rate_deviation = np.random.uniform(15, 45)
            response_hours = np.random.uniform(24, 96)
            compliance_score = np.random.uniform(20, 55)
            load_utilization = np.random.uniform(25, 50)
        else:
            on_time_pct = np.random.uniform(82, 99)
            damage_rate = np.random.uniform(0.1, 2.5)
            rate_deviation = np.random.uniform(-5, 10)
            response_hours = np.random.uniform(0.5, 8)
            compliance_score = np.random.uniform(70, 100)
            load_utilization = np.random.uniform(65, 95)

        records.append({
            "on_time_delivery_pct": on_time_pct,
            "damage_rate_pct": damage_rate,
            "rate_deviation_pct": rate_deviation,
            "avg_response_hours": response_hours,
            "compliance_score": compliance_score,
            "load_utilization_pct": load_utilization,
            "is_anomaly": 1 if is_anomaly else 0,
        })

    return pd.DataFrame(records)


def train_anomaly_detector():
    print("=" * 60)
    print("2. TRAINING ANOMALY / RISK DETECTION MODEL")
    print("=" * 60)

    df = generate_carrier_data(8000)
    features = ["on_time_delivery_pct", "damage_rate_pct", "rate_deviation_pct",
                "avg_response_hours", "compliance_score", "load_utilization_pct"]
    X = df[features]

    model = IsolationForest(
        n_estimators=200,
        contamination=0.08,
        max_samples=0.8,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X)

    # Evaluate against known labels
    preds = model.predict(X)
    # IsolationForest: -1 = anomaly, 1 = normal
    pred_labels = (preds == -1).astype(int)
    acc = accuracy_score(df["is_anomaly"], pred_labels)

    anomaly_count = pred_labels.sum()
    print(f"  Samples: {len(df)}")
    print(f"  Anomalies detected: {anomaly_count} ({anomaly_count/len(df)*100:.1f}%)")
    print(f"  Detection accuracy: {acc:.4f}")

    joblib.dump(model, os.path.join(MODELS_DIR, "anomaly_detector.joblib"))
    joblib.dump(features, os.path.join(MODELS_DIR, "anomaly_features.joblib"))

    meta = {"accuracy": round(acc, 4), "samples": len(df), "anomaly_rate": round(anomaly_count/len(df), 4)}
    json.dump(meta, open(os.path.join(MODELS_DIR, "anomaly_meta.json"), "w"))
    print("  ✓ Saved anomaly_detector.joblib\n")
    return model


# ============================================================
# 3. CARBON EMISSION ESTIMATOR
# ============================================================
def generate_emission_data(n=12000):
    """Generate freight emission data based on DEFRA-style emission factors."""
    # DEFRA 2023 emission factors (kg CO₂ per ton-km)
    EMISSION_FACTORS = {
        "FTL_32ft": 0.062, "FTL_20ft": 0.072, "PTL": 0.095,
        "Container_20ft": 0.048, "Container_40ft": 0.041, "Reefer": 0.110,
    }

    records = []
    for _ in range(n):
        origin = np.random.choice(CITIES)
        dest = np.random.choice([c for c in CITIES if c != origin])
        distance = haversine_km(*CITY_COORDS[origin], *CITY_COORDS[dest])

        vehicle = np.random.choice(VEHICLE_TYPES)
        weight = np.random.uniform(1, 25)
        load_factor = np.random.uniform(0.4, 1.0)
        is_highway = np.random.random() > 0.3
        avg_speed_kmh = np.random.uniform(25, 65)

        # Base emission from DEFRA factor
        base_emission = EMISSION_FACTORS[vehicle] * weight * distance

        # Adjustments
        speed_factor = 1.0 + 0.3 * (1 - avg_speed_kmh / 60)  # slower = more emission
        load_factor_adj = 1.0 + 0.2 * (1 - load_factor)  # lower utilization = more per-unit emission
        highway_factor = 0.85 if is_highway else 1.15

        co2_kg = base_emission * speed_factor * load_factor_adj * highway_factor
        co2_kg *= (1 + np.random.normal(0, 0.05))  # noise
        co2_kg = max(co2_kg, 0.5)

        records.append({
            "distance_km": distance,
            "vehicle_type": VEHICLE_TYPES.index(vehicle),
            "weight_tons": weight,
            "load_factor": load_factor,
            "is_highway": int(is_highway),
            "avg_speed_kmh": avg_speed_kmh,
            "co2_kg": round(co2_kg, 2),
        })

    return pd.DataFrame(records)


def train_carbon_estimator():
    print("=" * 60)
    print("3. TRAINING CARBON EMISSION ESTIMATOR")
    print("=" * 60)

    df = generate_emission_data(12000)
    features = ["distance_km", "vehicle_type", "weight_tons",
                "load_factor", "is_highway", "avg_speed_kmh"]
    X = df[features]
    y = df["co2_kg"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=8,
        learning_rate=0.1,
        min_samples_split=5,
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"  Samples: {len(df)}")
    print(f"  MAE: {mae:.2f} kg CO₂")
    print(f"  R² Score: {r2:.4f}")

    joblib.dump(model, os.path.join(MODELS_DIR, "carbon_estimator.joblib"))
    joblib.dump(features, os.path.join(MODELS_DIR, "carbon_features.joblib"))

    meta = {"mae_kg": round(mae, 2), "r2": round(r2, 4), "samples": len(df)}
    json.dump(meta, open(os.path.join(MODELS_DIR, "carbon_meta.json"), "w"))
    print("  ✓ Saved carbon_estimator.joblib\n")
    return model


# ============================================================
# 4. NLP INTENT CLASSIFIER
# ============================================================
def build_intent_dataset():
    """Build training data for logistics intent classification."""
    intents = {
        "rate_query": [
            "What is the freight rate from Mumbai to Delhi?",
            "How much does it cost to ship from Chennai to Bangalore?",
            "Current FTL rate for Pune to Hyderabad",
            "What are the rates for container shipping from JNPT?",
            "Rate for 20 ton shipment from Ahmedabad to Kolkata",
            "Freight charges from Surat to Jaipur",
            "Cost estimate for Lucknow to Nagpur route",
            "How much to transport goods from Kochi to Vizag?",
            "Price quote for Delhi to Chandigarh FTL",
            "Rate check for Mumbai to Pune partial load",
            "What will it cost to ship 15 tons from Indore to Bhopal?",
            "Current market rate for Ludhiana to Delhi corridor",
            "Cheapest shipping option from Coimbatore to Chennai",
            "Rate comparison for different truck types Mumbai to Ahmedabad",
            "What is the going rate per km for FTL 32ft?",
            "Freight cost for FMCG goods Bangalore to Hyderabad",
            "How much for reefer transport from Pune to Mumbai?",
            "Spot rate for chemicals from Vizag to Chennai",
            "Rate for automotive parts from Pune to Delhi",
            "Express delivery rate from Mumbai to Kolkata",
        ],
        "route_optimization": [
            "Optimize the Mumbai to Chennai route",
            "Find the best route from Delhi to Bangalore",
            "Which route has least congestion from Pune to Hyderabad?",
            "Suggest alternative routes for Kolkata to Mumbai",
            "Optimize my supply chain between Ahmedabad and Delhi",
            "Best lanes for reducing transit time to Chennai",
            "Multi-stop optimization Delhi Jaipur Ahmedabad Mumbai",
            "Route with best fuel efficiency from Nagpur to Hyderabad",
            "How can I reduce transit days on the north-south corridor?",
            "Optimize load consolidation for western India routes",
            "Find fastest route from Guwahati to Kolkata",
            "Avoid congested highways between Pune and Bangalore",
            "Best intermodal option for Mumbai to Chennai",
            "Optimize my fleet routing for next week",
            "Reduce empty miles on return trips from Delhi",
            "Smart routing for time-sensitive delivery to Kochi",
            "Reroute around the flooding on NH48",
            "What is the fastest lane from Ludhiana to Mumbai?",
            "Optimize multi-city delivery Hyderabad Vizag Chennai",
            "Suggest consolidation opportunities for PTL loads",
        ],
        "sustainability": [
            "What is the carbon footprint of my shipment?",
            "Calculate CO2 emissions for Mumbai to Delhi truck",
            "How can I reduce emissions on my routes?",
            "Green route options from Chennai to Bangalore",
            "ESG report for my Q3 logistics operations",
            "Carbon offset needed for 100 ton freight",
            "Which vehicle type has lowest emissions?",
            "Sustainability score for my carrier fleet",
            "BRSR compliance status for my shipments",
            "Compare rail vs road emissions for long haul",
            "Carbon credits from switching to intermodal",
            "Environmental impact of my Pune to Kolkata shipments",
            "How much CO2 saved by rail-road shift?",
            "Green logistics report for annual review",
            "Emissions per ton-km for different corridors",
            "Sustainable transporter recommendations",
            "Net zero roadmap for our freight operations",
            "Carbon intensity of reefer shipments",
            "ESG metrics for our supply chain",
            "Scope 3 emissions from transportation",
        ],
        "risk_detection": [
            "Any disruptions on the Mumbai Delhi corridor?",
            "Check carrier risk score for SafeExpress",
            "Is there a strike or blockade on NH44?",
            "Weather alerts for shipments in transit",
            "GST compliance check for my transporters",
            "E-way bill expiry warnings",
            "Risk assessment for shipping chemicals via Vizag port",
            "Carrier safety rating for new transporter",
            "Port congestion status at JNPT Mumbai",
            "Are there any delays expected on southern routes?",
            "Compliance issues flagged this week",
            "Anomaly alert for unusual pricing patterns",
            "Political unrest impact on eastern corridor",
            "Monsoon risk assessment for July shipments",
            "Insurance claim patterns for carrier ABC Transport",
            "Fraud detection in billing from transporters",
            "Regulatory changes affecting cross-state freight",
            "Toll booth delays on western express highway",
            "Fuel price spike risk for next month",
            "Vehicle breakdown prediction for fleet",
        ],
        "agent_status": [
            "What is the status of agents?",
            "Are all agents running?",
            "Show me agent health dashboard",
            "Procurement agent status",
            "How many agents are deployed?",
            "Agent performance metrics",
            "Is the optimization engine active?",
            "Current agent workload",
            "Agent uptime report",
            "System health check",
            "Are agents processing normally?",
            "Show deployed agent list",
            "Report on agent operations today",
            "Any agent failures or errors?",
            "Agent throughput this hour",
            "Check if risk detection agent is active",
            "Sustainability agent last run status",
            "Agent response time metrics",
            "Dashboard overview of all agents",
            "How many queries processed today?",
        ],
        "roi_calculation": [
            "Calculate ROI for my logistics spend",
            "What savings can I expect with LoRRI?",
            "ROI projection for ₹50 crore freight budget",
            "Cost benefit analysis of switching to LoRRI",
            "How much can I save on procurement?",
            "Projected savings for next quarter",
            "ROI from optimizing my top 50 lanes",
            "What is the payback period?",
            "Annual savings estimate for my company",
            "Compare my current costs vs LoRRI optimized",
            "Break-even analysis for platform adoption",
            "Total cost of ownership vs savings",
            "ROI from carbon credit generation",
            "Financial impact of route optimization",
            "How long until this pays for itself?",
            "Return on investment from automated bidding",
            "Savings forecast for FMCG freight",
            "Cost reduction estimate for ₹200 crore spend",
            "Expected efficiency gains from AI agents",
            "Calculate potential savings for our fleet",
        ],
        "general": [
            "Hello",
            "Hi there",
            "What can you do?",
            "Help me with logistics",
            "Tell me about LoRRI",
            "How does this work?",
            "What is LoRRI.ai?",
            "Good morning",
            "I need help",
            "Show me the dashboard",
            "Who built this platform?",
            "About LogisticsNow",
            "What services do you offer?",
            "How to get started?",
            "Can you help with freight management?",
            "Thanks for the help",
            "Goodbye",
            "What are LoRRI's features?",
            "Give me an overview",
            "Show me what you can do",
        ],
    }
    texts, labels = [], []
    for intent, examples in intents.items():
        texts.extend(examples)
        labels.extend([intent] * len(examples))
    return texts, labels


def train_intent_classifier():
    print("=" * 60)
    print("4. TRAINING NLP INTENT CLASSIFIER")
    print("=" * 60)

    texts, labels = build_intent_dataset()

    # TF-IDF vectorization
    tfidf = TfidfVectorizer(
        max_features=3000,
        ngram_range=(1, 3),
        stop_words="english",
        sublinear_tf=True,
    )
    X = tfidf.fit_transform(texts)

    le = LabelEncoder()
    y = le.fit_transform(labels)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = LogisticRegression(
        C=5.0,
        max_iter=1000,
        solver="lbfgs",
        multi_class="multinomial",
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"  Intents: {list(le.classes_)}")
    print(f"  Training samples: {len(texts)}")
    print(f"  Accuracy: {acc:.4f}")

    joblib.dump(model, os.path.join(MODELS_DIR, "intent_classifier.joblib"))
    joblib.dump(tfidf, os.path.join(MODELS_DIR, "intent_tfidf.joblib"))
    joblib.dump(le, os.path.join(MODELS_DIR, "intent_labels.joblib"))

    meta = {"accuracy": round(acc, 4), "intents": list(le.classes_), "samples": len(texts)}
    json.dump(meta, open(os.path.join(MODELS_DIR, "intent_meta.json"), "w"))
    print("  ✓ Saved intent_classifier.joblib\n")
    return model


# ============================================================
# 5. DEMAND FORECASTER
# ============================================================
def generate_demand_data(n=10000):
    """Generate time-series freight demand data."""
    records = []
    for _ in range(n):
        origin = np.random.choice(CITIES)
        dest = np.random.choice([c for c in CITIES if c != origin])
        distance = haversine_km(*CITY_COORDS[origin], *CITY_COORDS[dest])

        month = np.random.randint(1, 13)
        day_of_week = np.random.randint(0, 7)
        week_of_year = np.random.randint(1, 53)
        is_festive = 1 if month in [10, 11, 12, 1] else 0
        is_monsoon = 1 if month in [6, 7, 8, 9] else 0

        # Base demand with seasonal patterns
        base = 50 + 0.02 * distance
        seasonal = 20 * np.sin(2 * np.pi * (month - 3) / 12)
        festive_boost = 30 if is_festive else 0
        monsoon_dip = -15 if is_monsoon else 0
        weekend_dip = -10 if day_of_week >= 5 else 0

        demand = base + seasonal + festive_boost + monsoon_dip + weekend_dip
        demand *= (1 + np.random.normal(0, 0.1))
        demand = max(demand, 5)

        records.append({
            "distance_km": distance,
            "month": month,
            "day_of_week": day_of_week,
            "week_of_year": week_of_year,
            "is_festive": is_festive,
            "is_monsoon": is_monsoon,
            "shipment_count": round(demand),
        })

    return pd.DataFrame(records)


def train_demand_forecaster():
    print("=" * 60)
    print("5. TRAINING DEMAND FORECASTER")
    print("=" * 60)

    df = generate_demand_data(10000)
    features = ["distance_km", "month", "day_of_week", "week_of_year", "is_festive", "is_monsoon"]
    X = df[features]
    y = df["shipment_count"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = Ridge(alpha=1.0)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"  Samples: {len(df)}")
    print(f"  MAE: {mae:.1f} shipments")
    print(f"  R² Score: {r2:.4f}")

    joblib.dump(model, os.path.join(MODELS_DIR, "demand_forecaster.joblib"))
    joblib.dump(features, os.path.join(MODELS_DIR, "demand_features.joblib"))

    meta = {"mae": round(mae, 1), "r2": round(r2, 4), "samples": len(df)}
    json.dump(meta, open(os.path.join(MODELS_DIR, "demand_meta.json"), "w"))
    print("  ✓ Saved demand_forecaster.joblib\n")
    return model


# ============================================================
# MAIN — Train all models
# ============================================================
if __name__ == "__main__":
    print("\n🚀 LoRRI.ai — ML Training Pipeline\n")
    print(f"Output directory: {MODELS_DIR}\n")

    train_rate_predictor()
    train_anomaly_detector()
    train_carbon_estimator()
    train_intent_classifier()
    train_demand_forecaster()

    # List saved models
    saved = [f for f in os.listdir(MODELS_DIR)]
    print("=" * 60)
    print(f"✅ ALL MODELS TRAINED — {len(saved)} files saved:")
    for f in sorted(saved):
        size = os.path.getsize(os.path.join(MODELS_DIR, f))
        print(f"   {f} ({size/1024:.1f} KB)")
    print("=" * 60)
