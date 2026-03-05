// /api/ml/route — ML-powered route optimization
// Calls Python ML backend for TSP nearest-neighbor optimization

const ML_BASE = process.env.ML_API_URL || 'http://localhost:8000';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { origin, destination, waypoints, optimize_for } = body;

  if (!origin || !destination) {
    return Response.json({ error: '"origin" and "destination" are required.' }, { status: 400 });
  }

  try {
    const mlResponse = await fetch(`${ML_BASE}/optimize/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination,
        waypoints: waypoints || [],
        optimize_for: optimize_for || 'cost',
      }),
    });

    if (!mlResponse.ok) {
      const err = await mlResponse.json().catch(() => ({}));
      return Response.json({ error: err.detail || 'Optimization failed' }, { status: mlResponse.status });
    }

    const result = await mlResponse.json();

    return Response.json({
      ...result,
      source: 'ml_optimization',
      engine: 'Nearest-Neighbor TSP with Haversine distance',
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
    endpoint: '/api/ml/route',
    method: 'POST',
    description: 'Route optimization using TSP nearest-neighbor heuristic',
    required_fields: { origin: 'string', destination: 'string' },
    optional_fields: {
      waypoints: 'string[] — intermediate cities to visit',
      optimize_for: 'cost | time | carbon',
    },
    supported_cities: [
      'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
      'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Nagpur', 'Indore',
      'Coimbatore', 'Vizag', 'Kochi', 'Chandigarh', 'Guwahati', 'Bhopal',
      'Surat', 'Ludhiana',
    ],
    example: {
      origin: 'Mumbai',
      destination: 'Kolkata',
      waypoints: ['Nagpur', 'Hyderabad', 'Vizag'],
      optimize_for: 'cost',
    },
  });
}
