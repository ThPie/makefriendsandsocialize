import { useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export const useConfetti = () => {
  const hasFireRef = useRef(false);

  const fireConfetti = useCallback(() => {
    // Heart-shaped burst
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    // Multiple bursts for a more dramatic effect
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#C65D3B', '#1B4332', '#FAF7F2'],
    });

    fire(0.2, {
      spread: 60,
      colors: ['#C65D3B', '#FF8C69'],
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#1B4332', '#3D8B5F'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#FAF7F2', '#FFD700'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#C65D3B', '#1B4332'],
    });
  }, []);

  const fireOnce = useCallback(() => {
    if (!hasFireRef.current) {
      hasFireRef.current = true;
      fireConfetti();
    }
  }, [fireConfetti]);

  const reset = useCallback(() => {
    hasFireRef.current = false;
  }, []);

  return { fireConfetti, fireOnce, reset };
};

export const fireCelebration = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#C65D3B', '#1B4332', '#FAF7F2'],
  });

  fire(0.2, {
    spread: 60,
    colors: ['#C65D3B', '#FF8C69'],
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#1B4332', '#3D8B5F'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#FAF7F2', '#FFD700'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#C65D3B', '#1B4332'],
  });
};
