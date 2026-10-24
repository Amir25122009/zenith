import confetti from 'canvas-confetti';

export function triggerCelebrationConfetti() {
  if (typeof window === 'undefined') return;

  // Dual-cannon celebration blast
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7, x: 0.3 },
    colors: ['#2D5A3D', '#4A7C59', '#C9A96E', '#E8C07D', '#6366F1'],
  });

  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7, x: 0.7 },
    colors: ['#2D5A3D', '#4A7C59', '#C9A96E', '#E8C07D', '#6366F1'],
  });
}

export function triggerMiniConfetti(x = 0.5, y = 0.5) {
  if (typeof window === 'undefined') return;
  confetti({
    particleCount: 35,
    spread: 50,
    origin: { x, y },
    colors: ['#2D5A3D', '#C9A96E', '#8FBC8F'],
  });
}
