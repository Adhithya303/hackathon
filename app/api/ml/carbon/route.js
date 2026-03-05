// /api/ml/carbon — ML-powered carbon emission estimation
// Calls Python ML backend for GradientBoosting inference

const ML_BASE = process.env.ML_API_URL || 'http://localhost:8000';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { origin, destination, vehicle_type, weight_tons, load_factor, is_highway, avg_speed_kmh } = body;

  if (!origin || !destination) {
    return Response.json({ error: '"origin" and "destination" are required.' }, { status: 400 });
  }

  try {
    const mlResponse = await fetch(`${ML_BASE}/predict/carbon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination,
        vehicle_type: vehicle_type || 'FTL_32ft',
        weight_tons: weight_tons || 10,
        load_factor: load_factor || 0.75,
        is_highway: is_highway !== undefined ? is_highway : true,
        avg_speed_kmh: avg_speed_kmh || 45,
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
      engine: 'GradientBoosting (200 trees, trained on 12,000 DEFRA-calibrated samples)',
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
    endpoint: '/api/ml/carbon',
    method: 'POST',
    description: 'CO₂ emission prediction using GradientBoosting model calibrated with DEFRA emission factors',
    model: 'GradientBoosting Regressor (200 trees, R²=0.988, MAE=63 kg CO₂)',
    required_fields: { origin: 'string', destination: 'string' },
    optional_fields: {
      vehicle_type: 'FTL_32ft | FTL_20ft | PTL | Container_20ft | Container_40ft | Reefer',
      weight_tons: 'number', load_factor: '0-1', is_highway: 'boolean', avg_speed_kmh: 'number',
    },
  });
}
