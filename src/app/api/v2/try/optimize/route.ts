import { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/utils/rate-limit';

const limiter = rateLimit({
  interval: 5 * 60 * 1000, // 5 minutes
  uniqueTokenPerInterval: 500, // Allow up to 500 unique IPs per window
});

interface OptimizeRequest {
  prompt: string;
  guest_session_id: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface SSEEvent {
  type: string;
  data: any;
}

function createSSEResponse() {
  return new Response(
    new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        function sendEvent(event: SSEEvent) {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }

        function sendDone() {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }

        return { sendEvent, sendDone };
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

async function simulateOptimization(
  request: OptimizeRequest,
  sendEvent: (event: SSEEvent) => void
): Promise<void> {
  const { prompt, guest_session_id } = request;

  // Send stream start
  sendEvent({
    type: 'stream_start',
    data: { session_id: guest_session_id },
  });

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 200));

  // Simulate token streaming
  const optimizedPrompt = generateOptimizedPrompt(prompt);
  const tokens = optimizedPrompt.split(' ');

  for (let i = 0; i < tokens.length; i++) {
    const token = i === 0 ? tokens[i] : ' ' + tokens[i];
    sendEvent({
      type: 'token',
      data: { token, is_final: i === tokens.length - 1 },
    });

    // Small delay between tokens
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Send insights
  await new Promise(resolve => setTimeout(resolve, 100));
  sendEvent({
    type: 'insight',
    data: {
      items: generateInsights(prompt),
    },
  });

  // Send suggestions
  await new Promise(resolve => setTimeout(resolve, 100));
  sendEvent({
    type: 'suggestions',
    data: {
      items: generateSuggestions(prompt),
    },
  });

  // Send optimization result
  sendEvent({
    type: 'optimization_result',
    data: {
      before: prompt,
      after: optimizedPrompt,
    },
  });

  // Send completion
  sendEvent({
    type: 'stream_complete',
    data: {
      usage: {
        input_tokens: Math.ceil(prompt.length / 4),
        output_tokens: Math.ceil(optimizedPrompt.length / 4),
      },
    },
  });
}

function generateOptimizedPrompt(originalPrompt: string): string {
  // Simple optimization logic for demo
  const prompt = originalPrompt.trim();

  let optimized = prompt;

  // Add structure if missing
  if (!prompt.includes('Please') && !prompt.includes('please')) {
    optimized = 'Please ' + optimized.toLowerCase();
  }

  // Add specificity
  if (prompt.length < 100) {
    optimized += ' Please provide a detailed response with specific examples and actionable insights.';
  }

  // Add context if it seems like a creative task
  if (prompt.toLowerCase().includes('write') || prompt.toLowerCase().includes('create')) {
    optimized += ' Consider the target audience, tone, and desired outcome.';
  }

  // Add constraints for analysis tasks
  if (prompt.toLowerCase().includes('analyze') || prompt.toLowerCase().includes('review')) {
    optimized += ' Please structure your analysis with clear headings and provide specific recommendations.';
  }

  return optimized;
}

function generateInsights(prompt: string): Array<{ text: string; confidence: number }> {
  const insights = [];
  const lowerPrompt = prompt.toLowerCase();

  if (prompt.length < 50) {
    insights.push({
      text: 'Adding more context would improve response quality',
      confidence: 0.85,
    });
  }

  if (!lowerPrompt.includes('please') && !lowerPrompt.includes('?')) {
    insights.push({
      text: 'Using polite language increases AI cooperation',
      confidence: 0.78,
    });
  }

  if (lowerPrompt.includes('write') || lowerPrompt.includes('create')) {
    insights.push({
      text: 'Specifying target audience would enhance output relevance',
      confidence: 0.82,
    });
  }

  if (!insights.length) {
    insights.push({
      text: 'Prompt structure looks good for getting quality responses',
      confidence: 0.75,
    });
  }

  return insights;
}

function generateSuggestions(prompt: string): string[] {
  const suggestions = [];
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('write')) {
    suggestions.push('Specify target audience');
    suggestions.push('Define desired tone');
    suggestions.push('Set word count limit');
  } else if (lowerPrompt.includes('analyze')) {
    suggestions.push('Add evaluation criteria');
    suggestions.push('Request specific format');
    suggestions.push('Include comparison points');
  } else {
    suggestions.push('Add more context');
    suggestions.push('Specify desired format');
    suggestions.push('Include examples');
  }

  return suggestions.slice(0, 4);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    try {
      await limiter.check(10, ip); // 10 requests per window per IP
    } catch {
      return new Response(
        JSON.stringify({
          type: 'error',
          data: { code: 429, message: 'Rate limit exceeded. Try again in 5 minutes.' },
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body: OptimizeRequest = await request.json();

    // Validate request
    if (!body.prompt || typeof body.prompt !== 'string') {
      return new Response(
        JSON.stringify({
          type: 'error',
          data: { code: 400, message: 'Invalid prompt provided' },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Limit prompt length
    if (body.prompt.length > 8000) {
      return new Response(
        JSON.stringify({
          type: 'error',
          data: { code: 400, message: 'Prompt too long (max 8000 characters)' },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create SSE stream
    return new Response(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          function sendEvent(event: SSEEvent) {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          function sendDone() {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          }

          try {
            await simulateOptimization(body, sendEvent);
            sendDone();
          } catch (error) {
            sendEvent({
              type: 'error',
              data: {
                code: 500,
                message: 'Internal server error',
              },
            });
            sendDone();
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Optimize endpoint error:', error);
    return new Response(
      JSON.stringify({
        type: 'error',
        data: { code: 500, message: 'Internal server error' },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}