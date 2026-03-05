export type StarParticle = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
};

export const createStarField = (count: number): StarParticle[] => {
  const stars: StarParticle[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: Math.random(),
      y: Math.random(),
      size: 1 + Math.random() * 2,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 10,
      opacity: 0.3 + Math.random() * 0.7,
    });
  }
  return stars;
};

