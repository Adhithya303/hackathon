// /api/ml/rate — ML-powered freight rate prediction
// Calls Python ML backend (FastAPI) for real model inference

const ML_BASE = process.env.ML_API_URL || 'http://localhost:8000';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { origin, destination, vehicle_type, cargo_type, weight_tons, month, diesel_price } = body;

  if (!origin || !destination) {
    return Response.json(
      { error: '"origin" and "destination" are required.' },
      { status: 400 }
    );
  }

  try {
    const mlResponse = await fetch(`${ML_BASE}/predict/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination,
        vehicle_type: vehicle_type || 'FTL_32ft',
        cargo_type: cargo_type || 'General',
        weight_tons: weight_tons || 10,
        month: month || new Date().getMonth() + 1,
        diesel_price: diesel_price || 95,
      }),
    });

    if (!mlResponse.ok) {
      const err = await mlResponse.json().catch(() => ({}));
      return Response.json(
        { error: err.detail || 'ML prediction failed', fallback: true },
        { status: mlResponse.status }
      );
    }

    const prediction = await mlResponse.json();

    return Response.json({
      ...prediction,
      source: 'ml_model',
      engine: 'RandomForest (150 trees, trained on 15,000 samples)',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Fallback if ML server is down — use formula-based estimate
    return Response.json({
      origin,
      destination,
      predicted_rate_inr: null,
      error: 'ML server unavailable — start with: python ml/server.py',
      fallback: true,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}

export async function GET() {
  return Response.json({
    endpoint: '/api/ml/rate',
    method: 'POST',
    description: 'ML-powered freight rate prediction using Random Forest model',
    model: 'RandomForest Regressor (150 trees, R²=0.977, MAE=₹6,837)',
    training_data: '15,000 synthetic Indian freight samples',
    required_fields: { origin: 'string', destination: 'string' },
    optional_fields: {
      vehicle_type: 'FTL_32ft | FTL_20ft | PTL | Container_20ft | Container_40ft | Reefer',
      cargo_type: 'General | FMCG | Automotive | Chemicals | Electronics | Pharma | Textiles | Agri',
      weight_tons: 'number (1-25)',
      month: 'number (1-12)',
      diesel_price: 'number (₹/litre)',
    },
    example: {
      origin: 'Mumbai',
      destination: 'Delhi',
      vehicle_type: 'FTL_32ft',
      cargo_type: 'FMCG',
      weight_tons: 15,
    },
  });
}
