// /api/ml/demand — ML-powered freight demand forecasting
// Calls Python ML backend for Ridge Regression inference

const ML_BASE = process.env.ML_API_URL || 'http://localhost:8000';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { origin, destination, month, day_of_week, week_of_year } = body;

  if (!origin || !destination) {
    return Response.json({ error: '"origin" and "destination" are required.' }, { status: 400 });
  }

  try {
    const mlResponse = await fetch(`${ML_BASE}/predict/demand`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination,
        month: month || new Date().getMonth() + 1,
        day_of_week: day_of_week !== undefined ? day_of_week : new Date().getDay(),
        week_of_year: week_of_year || Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1)) / 604800000),
      }),
    });

    if (!mlResponse.ok) {
      const err = await mlResponse.json().catch(() => ({}));
      return Response.json({ error: err.detail || 'ML prediction failed' }, { status: mlResponse.status });
    }

    const prediction = await mlResponse.json();

    return Response.json({
      ...prediction,
      source: 'ml_model',
      engine: 'Ridge Regression (time-series features, trained on 10,000 samples)',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json({
      origin, destination,
      error: 'ML server unavailable — start with: python ml/server.py',
      fallback: true,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}

export async function GET() {
  return Response.json({
    endpoint: '/api/ml/demand',
    method: 'POST',
    description: 'Freight demand forecasting using Ridge Regression with seasonal features',
    model: 'Ridge Regression (R²=0.59, MAE=9.2 shipments)',
    required_fields: { origin: 'string', destination: 'string' },
    optional_fields: { month: '1-12', day_of_week: '0-6', week_of_year: '1-52' },
  });
}
