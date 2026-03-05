import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { SYSTEM_PROMPT, generateRecommendationPrompt, AIContext } from '@/lib/aiPrompts';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context }: { messages: ChatMessage[]; context?: AIContext } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Build system prompt with context if provided
    let systemPrompt = SYSTEM_PROMPT;
    
    if (context) {
      const contextPrompt = generateRecommendationPrompt(context);
      systemPrompt = `${SYSTEM_PROMPT}\n\n${contextPrompt}`;
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.95,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      text: response,
      usage: completion.usage,
    });
  } catch (error) {
    console.error('Lentera AI API Error:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'Groq API key not configured. Please add GROQ_API_KEY to your .env.local' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
