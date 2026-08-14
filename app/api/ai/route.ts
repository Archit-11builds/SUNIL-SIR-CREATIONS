import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-3.5-flash';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Auren Intelligence is not connected yet. Add GEMINI_API_KEY in .env.local or Vercel Env.',
        },
        { status: 503 },
      );
    }

    const body = await request.json();

    const prompt =
      typeof body?.prompt === 'string' ? body.prompt.trim() : '';

    const context = body?.context ?? {};

    if (!prompt) {
      return NextResponse.json(
        { error: 'Please enter a question.' },
        { status: 400 },
      );
    }

    if (prompt.length > 3000) {
      return NextResponse.json(
        { error: 'Please keep your question under 3000 characters.' },
        { status: 400 },
      );
    }

    const systemInstruction = `You are Auren Intelligence, a friendly Class 10 CBSE study assistant.

Rules:
- Explain at a Class 10 level using simple, accurate language.
- Prefer NCERT-aligned concepts and board-style practice.
- For maths and science, show clear steps.
- For study plans, be practical and time-aware.
- Never pretend you checked a source unless one was actually provided.
- If you are unsure about a current CBSE rule or announcement, say it should be checked on the official CBSE website.
- Keep normal answers concise but useful.
- Do not do the student's work dishonestly; teach and guide.

Student context:
${JSON.stringify(context)}`;

    const ai = new GoogleGenAI({ apiKey });

    const interaction = await ai.interactions.create({
      model: MODEL,
      system_instruction: systemInstruction,
      input: prompt,
      generation_config: {
        max_output_tokens: 900,
        thinking_level: 'low',
      },
    });

    const text = interaction.output_text?.trim();

    if (!text) {
      return NextResponse.json(
        { error: 'The AI did not return a text response.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Auren Intelligence error:', error);

    return NextResponse.json(
      {
          error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}