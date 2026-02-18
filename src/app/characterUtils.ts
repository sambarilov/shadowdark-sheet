
import { ItemData } from "./types";

export function abilityModifier(value: string | number): number {
  const numValue = typeof value === 'string' ? parseInt(value) : value;
  if (isNaN(numValue)) return 0;
  return Math.floor((numValue - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function calculateAC(inventory: ItemData[], acBonus: number, dexBonus: number): number {
  let ac = 10;
  
  // Best equipped armor AC
  const bestArmor = inventory.filter(
    (item: ItemData) => item.type === 'armor' && item.equipped && item.armorAC !== undefined
  ).sort((a: ItemData, b: ItemData) => b.armorAC! - a.armorAC!)[0];

  if (bestArmor) {
    const highestArmorAC = bestArmor.armorAC || 0;
    ac = highestArmorAC;
  }

  ac += !bestArmor || (bestArmor.slots || 0 <= 2) ? dexBonus : 0;
  
  // Add best equipped shield bonus
  const equippedShields = inventory.filter(
    (item: ItemData) => item.type === 'shield' && item.equipped
  );

  if (equippedShields.length > 0) {
    const highestShieldBonus = Math.max(...equippedShields.map((item: ItemData) => item.shieldACBonus || 0));
    ac += highestShieldBonus;
  }
  
  // Add AC bonus
  ac += acBonus;
  
  return ac;
};