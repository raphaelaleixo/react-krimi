export function generateDistressedCircle(): string {
  const points: string[] = [];
  const steps = 72;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const bite = Math.random() < 0.3 ? Math.random() * 8 : 0;
    const r = 50 - bite;
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
  return `polygon(${points.join(', ')})`;
}

export function generateTornBottomEdge(): string {
  const topPoints: string[] = ['0% 0%', '100% 0%'];
  const bottomPoints: string[] = [];
  const steps = 40;
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * 100;
    const bite = Math.random() < 0.55 ? Math.random() * 12 : 0;
    bottomPoints.push(`${x.toFixed(1)}% ${(100 - bite).toFixed(1)}%`);
  }
  return `polygon(${[...topPoints, ...bottomPoints].join(', ')})`;
}
