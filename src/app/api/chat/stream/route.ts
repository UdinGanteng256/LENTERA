import { NextRequest } from 'next/server';
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
      return new Response('Messages are required', { status: 400 });
    }

    // Build system prompt with context if provided
    let systemPrompt = SYSTEM_PROMPT;

    if (context) {
      const contextPrompt = generateRecommendationPrompt(context);
      systemPrompt = `${SYSTEM_PROMPT}\n\n${contextPrompt}`;
    }

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.95,
      stream: true,
    });

    // Create a streaming response
    const encoder = new TextEncoder();

    const streaming = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'content',
                content
              }) + '\n'));
            }
          }
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'done' }) + '\n'));
          controller.close();
        } catch {
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'error',
            error: 'Streaming error'
          }) + '\n'));
          controller.close();
        }
      },
    });

    return new Response(streaming, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Lentera AI Stream API Error:', error);

    return new Response(
      JSON.stringify({ error: 'Failed to process AI request' }),
      { status: 500 }
    );
  }
}
