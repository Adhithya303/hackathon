// /api/ml/health — ML engine health and model metadata
// Calls Python ML backend health endpoint

const ML_BASE = process.env.ML_API_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const mlResponse = await fetch(`${ML_BASE}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!mlResponse.ok) {
      return Response.json({ status: 'degraded', error: 'ML server responded with error' }, { status: 500 });
    }

    const health = await mlResponse.json();

    return Response.json({
      ...health,
      proxy: 'next.js → fastapi',
      endpoints: {
        rate_prediction: '/api/ml/rate',
        carbon_estimation: '/api/ml/carbon',
        anomaly_detection: '/api/ml/anomaly',
        intent_classification: '/api/ml/intent',
        demand_forecasting: '/api/ml/demand',
        route_optimization: '/api/ml/route',
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json({
      status: 'offline',
      error: 'ML server not reachable. Start with: python ml/server.py',
      endpoints: {
        rate_prediction: '/api/ml/rate',
        carbon_estimation: '/api/ml/carbon',
        anomaly_detection: '/api/ml/anomaly',
        intent_classification: '/api/ml/intent',
        demand_forecasting: '/api/ml/demand',
        route_optimization: '/api/ml/route',
      },
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
