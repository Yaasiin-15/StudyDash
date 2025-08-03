import  confetti from 'canvas-confetti';

export const triggerLevelUpConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#FFD700', '#FFA500', '#FF4500']
  });
  
  fire(0.2, {
    spread: 60,
    colors: ['#9c27b0', '#3f51b5', '#2196f3']
  });
  
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#ff9999', '#99ff99', '#9999ff']
  });
  
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#ff0000', '#00ff00', '#0000ff']
  });
  
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#ffffff']
  });
}; 