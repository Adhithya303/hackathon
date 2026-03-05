// /api/ml/intent — ML-powered NLP intent classification
// Calls Python ML backend for TF-IDF + LogisticRegression inference

const ML_BASE = process.env.ML_API_URL || 'http://localhost:8000';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { text } = body;
  if (!text || typeof text !== 'string') {
    return Response.json({ error: '"text" is required.' }, { status: 400 });
  }

  try {
    const mlResponse = await fetch(`${ML_BASE}/predict/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!mlResponse.ok) {
      const err = await mlResponse.json().catch(() => ({}));
      return Response.json({ error: err.detail || 'ML prediction failed' }, { status: mlResponse.status });
    }

    const prediction = await mlResponse.json();

    return Response.json({
      ...prediction,
      source: 'ml_model',
      engine: 'TF-IDF (3000 features, trigrams) + LogisticRegression (7 intents)',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json({
      text,
      error: 'ML server unavailable — start with: python ml/server.py',
      fallback: true,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}

export async function GET() {
  return Response.json({
    endpoint: '/api/ml/intent',
    method: 'POST',
    description: 'NLP intent classification for logistics queries',
    model: 'TF-IDF + Multinomial Logistic Regression',
    intents: ['rate_query', 'route_optimization', 'sustainability', 'risk_detection',
              'agent_status', 'roi_calculation', 'general'],
    required_fields: { text: 'string' },
    example: { text: 'What is the freight rate from Mumbai to Delhi?' },
  });
}
