import confetti, { Options } from 'canvas-confetti';
import { create } from 'zustand';

// Pharaonic gold color palette for confetti
export const PHARAONIC_CONFETTI_COLORS = [
  '#C9A227', // Pharaoh Gold
  '#E9C25A', // Light Gold
  '#D4A574', // Sand Gold
  '#1E3A8A', // Lapis Blue (for contrast)
  '#0E7490', // Nile Teal (for contrast)
  '#EBD5A7', // Desert Sand
];

export interface ConfettiState {
  isConfettiActive: boolean;
  setConfettiActive: (active: boolean) => void;
}

export const useConfettiStore = create<ConfettiState>((set) => ({
  isConfettiActive: false,
  setConfettiActive: (active) => set({ isConfettiActive: active }),
}));

/**
 * Trigger a gold confetti burst - perfect for copy actions
 * Uses Pharaonic color palette with a subtle burst effect
 */
export async function triggerGoldConfetti(options?: Partial<Options>): Promise<void> {
  const defaults: Options = {
    origin: { y: 0.7 },
    zIndex: 9999,
    particleCount: 60,
    spread: 70,
    colors: PHARAONIC_CONFETTI_COLORS,
    disableForReducedMotion: true,
    ticks: 200,
    gravity: 0.8,
    drift: 0,
    startVelocity: 35,
    scalar: 1.2,
  };

  await confetti({
    ...defaults,
    ...options,
  });
}

/**
 * Trigger a pharaonic celebration confetti
 * More elaborate burst with multiple waves
 */
export async function triggerPharaonicCelebration(options?: Partial<Options>): Promise<void> {
  // First wave - gold burst
  await confetti({
    particleCount: 100,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#C9A227', '#E9C25A', '#D4A574'],
    ...options,
  });

  // Second wave - lapis & nile accents
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#1E3A8A', '#0E7490'],
      ...options,
    });
  }, 200);

  // Third wave - from right side
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#1E3A8A', '#0E7490'],
      ...options,
    });
  }, 400);
}

/**
 * Trigger a focused gold burst at specific coordinates
 * Perfect for copy buttons and action triggers
 */
export async function triggerFocusedGoldBurst(
  x: number,
  y: number,
  intensity: 'subtle' | 'medium' | 'strong' = 'medium'
): Promise<void> {
  const intensities = {
    subtle: { particleCount: 30, spread: 50, startVelocity: 25 },
    medium: { particleCount: 60, spread: 70, startVelocity: 35 },
    strong: { particleCount: 100, spread: 90, startVelocity: 45 },
  };

  const settings = intensities[intensity];

  await confetti({
    ...settings,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: PHARAONIC_CONFETTI_COLORS,
    zIndex: 9999,
    disableForReducedMotion: true,
    scalar: 0.8,
  });
}

/**
 * Trigger a continuous gold shower effect
 * Good for achievements and celebrations
 */
export function triggerGoldShower(duration: number = 3000): void {
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#C9A227', '#E9C25A'],
      disableForReducedMotion: true,
    });

    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#D4A574', '#1E3A8A'],
      disableForReducedMotion: true,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

/**
 * Copy text to clipboard with gold confetti celebration
 * Combines clipboard functionality with confetti effect
 */
export async function copyWithConfetti(
  text: string,
  options?: {
    intensity?: 'subtle' | 'medium' | 'strong';
    x?: number;
    y?: number;
    showToast?: boolean;
  }
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);

    // Trigger confetti at the button position or center of screen
    if (options?.x !== undefined && options?.y !== undefined) {
      await triggerFocusedGoldBurst(options.x, options.y, options.intensity || 'medium');
    } else {
      await triggerGoldConfetti();
    }

    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Trigger confetti from a React event
 * Automatically extracts coordinates from click event
 */
export async function triggerConfettiFromEvent(
  event: React.MouseEvent | React.TouchEvent,
  intensity: 'subtle' | 'medium' | 'strong' = 'medium'
): Promise<void> {
  let x: number, y: number;

  if ('clientX' in event) {
    x = event.clientX;
    y = event.clientY;
  } else {
    x = event.touches[0].clientX;
    y = event.touches[0].clientY;
  }

  await triggerFocusedGoldBurst(x, y, intensity);
}

/**
 * Hierarchy confetti cascade effect
 * Creates a cascading wave of gold particles from top to bottom
 */
export async function triggerGoldCascade(): Promise<void> {
  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 2,
      startVelocity: 30,
      spread: 360,
      origin: {
        x: Math.random(),
        y: Math.random() * 0.5 - 0.2,
      },
      colors: PHARAONIC_CONFETTI_COLORS,
      disableForReducedMotion: true,
      gravity: 1.5,
      drift: -0.5,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

/**
 * Reset confetti (clear all particles)
 */
export function resetConfetti(): void {
  confetti.reset();
}
