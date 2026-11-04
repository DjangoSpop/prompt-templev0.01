import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyPlain, selectText } from '../copy';

const SAMPLE = 'line one\r\nline two 🔥 <b>not html</b> {{name}}\n';

function setClipboard(writeText: ((t: string) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, 'clipboard', { value: writeText ? { writeText } : undefined, configurable: true });
}

function setExecCommand(impl: ((cmd: string) => boolean) | undefined) {
  Object.defineProperty(document, 'execCommand', { value: impl, configurable: true, writable: true });
}

afterEach(() => {
  setClipboard(undefined);
  setExecCommand(undefined);
});

describe('copyPlain', () => {
  it('uses navigator.clipboard.writeText with the exact text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);
    const exec = vi.fn(() => true);
    setExecCommand(exec);
    await copyPlain(SAMPLE);
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toBe(SAMPLE);
    expect(exec).not.toHaveBeenCalled();
  });

  it('falls back to execCommand when writeText rejects, with the exact text in the textarea', async () => {
    setClipboard(vi.fn().mockRejectedValue(new Error('NotAllowedError')));
    let seen = '';
    setExecCommand(
      vi.fn((cmd: string) => {
        seen = (document.activeElement as HTMLTextAreaElement | null)?.value ?? document.querySelector('textarea')?.value ?? '';
        return cmd === 'copy';
      })
    );
    // A textarea's API value normalises CRLF to LF (per spec), so the legacy path is byte-exact for LF text only.
    const lf = SAMPLE.replace(/\r\n/g, '\n');
    await expect(copyPlain(lf)).resolves.toBeUndefined();
    expect(seen).toBe(lf);
    expect(document.querySelector('textarea')).toBeNull(); // cleaned up
  });

  it('falls back to execCommand when the clipboard API is missing', async () => {
    setClipboard(undefined);
    const exec = vi.fn(() => true);
    setExecCommand(exec);
    await copyPlain('x');
    expect(exec).toHaveBeenCalledWith('copy');
  });

  it('throws copy_failed when both paths fail', async () => {
    setClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    setExecCommand(vi.fn(() => false));
    await expect(copyPlain(SAMPLE)).rejects.toThrow('copy_failed');
    setExecCommand(undefined);
    await expect(copyPlain(SAMPLE)).rejects.toThrow('copy_failed');
    setExecCommand(() => {
      throw new Error('boom');
    });
    await expect(copyPlain(SAMPLE)).rejects.toThrow('copy_failed');
  });
});

describe('selectText', () => {
  it('selects the element contents', () => {
    const el = document.createElement('pre');
    el.textContent = 'select me';
    document.body.appendChild(el);
    selectText(el);
    expect(window.getSelection()?.toString()).toBe('select me');
    el.remove();
  });
});
