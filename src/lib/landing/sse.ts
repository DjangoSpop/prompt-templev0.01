import { TIMING } from './motion';

export interface SSECallbacks {
  onWord: (word: string, section?: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

/**
 * Connect to an SSE endpoint for landing page demos.
 * Returns a cleanup function.
 */
export function connectSSE(
  url: string,
  body: Record<string, unknown>,
  callbacks: SSECallbacks
): () => void {
  const controller = new AbortController();
  let cancelled = false;

  const run = async () => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`SSE connection failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (cancelled) break;
          if (!line.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) {
              callbacks.onDone();
              return;
            }
            if (data.word !== undefined) {
              callbacks.onWord(data.word, data.section);
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }

      if (!cancelled) callbacks.onDone();
    } catch (err) {
      if (!cancelled && err instanceof Error && err.name !== 'AbortError') {
        callbacks.onError(err);
      }
    }
  };

  run();

  return () => {
    cancelled = true;
    controller.abort();
  };
}

/**
 * Simulate SSE streaming with pre-written text.
 * Includes punctuation pauses for natural reading rhythm.
 */
export function simulateSSEStream(
  text: string,
  onWord: (word: string) => void,
  onDone: () => void
): () => void {
  const words = text.split(' ');
  let index = 0;
  let timeoutId: ReturnType<typeof setTimeout>;
  let cancelled = false;

  const emitNext = () => {
    if (cancelled || index >= words.length) {
      if (!cancelled) onDone();
      return;
    }

    const word = words[index];
    onWord(word);
    index++;

    // Determine delay based on punctuation
    let delay = TIMING.SSE_WORD_DELAY;
    if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) {
      delay = TIMING.PUNCTUATION_PAUSE_PERIOD;
    } else if (word.endsWith(',') || word.endsWith(';') || word.endsWith(':')) {
      delay = TIMING.PUNCTUATION_PAUSE_COMMA;
    }

    timeoutId = setTimeout(emitNext, delay);
  };

  timeoutId = setTimeout(emitNext, TIMING.SSE_WORD_DELAY);

  return () => {
    cancelled = true;
    clearTimeout(timeoutId);
  };
}
