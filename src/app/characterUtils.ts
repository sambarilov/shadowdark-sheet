

export function abilityModifier(value: string | number): number {
  const numValue = typeof value === 'string' ? parseInt(value) : value;
  if (isNaN(numValue)) return 0;
  return Math.floor((numValue - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}