import { NextResponse } from 'next/server';

const MODEL = 'gemini-3.5-flash-lite';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Archit AI is not connected yet. Add GEMINI_API_KEY in your local .env.local or Vercel Environment Variables.' },
        { status: 503 },
      );
    }

    const body = await request.json();
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    const context = body?.context ?? {};

    if (!prompt) {
      return NextResponse.json({ error: 'Please enter a question.' }, { status: 400 });
    }
    if (prompt.length > 3000) {
      return NextResponse.json({ error: 'Please keep your question under 3000 characters.' }, { status: 400 });
    }

    const system = `You are Archit AI, a friendly Class 10 CBSE study assistant.\n\nRules:\n- Explain at a Class 10 level using simple, accurate language.\n- Prefer NCERT-aligned concepts and board-style practice.\n- For maths/science, show clear steps.\n- For study plans, be practical and time-aware.\n- Never pretend you checked a source unless one was actually provided.\n- If you are unsure about a current CBSE rule or announcement, say that it should be checked on the official CBSE website.\n- Keep normal answers concise but useful.\n- Do not do the student's work dishonestly; teach and guide.\n\nStudent context: ${JSON.stringify(context)}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.45, maxOutputTokens: 900 },
        }),
        cache: 'no-store',
      },
    );

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || 'The AI provider returned an error.';
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('').trim();
    if (!text) {
      return NextResponse.json({ error: 'The AI did not return a text response.' }, { status: 502 });
    }

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: 'Archit AI could not respond right now. Please try again.' }, { status: 500 });
  }
}
