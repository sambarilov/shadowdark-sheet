import { useState, useCallback } from 'react';

// Types for dice rolling
export type RollMode = 'normal' | 'advantage' | 'disadvantage';

export interface RollResult {
  rolls: number[];
  total: number;
  mode: RollMode;
  bonus?: number;
  description: string;
}

// Hook for dice rolling functionality
export function useDice() {
  const [lastResult, setLastResult] = useState<string | null>(null);

  const rollDie = useCallback((sides: number): number => {
    return Math.floor(Math.random() * sides) + 1;
  }, []);

  const rollD20 = useCallback((mode: RollMode = 'normal'): { roll: number; details: string } => {
    if (mode === 'advantage') {
      const roll1 = rollDie(20);
      const roll2 = rollDie(20);
      const roll = Math.max(roll1, roll2);
      return { roll, details: ` [${roll1}, ${roll2}]` };
    } else if (mode === 'disadvantage') {
      const roll1 = rollDie(20);
      const roll2 = rollDie(20);
      const roll = Math.min(roll1, roll2);
      return { roll, details: ` [${roll1}, ${roll2}]` };
    } else {
      const roll = rollDie(20);
      return { roll, details: '' };
    }
  }, [rollDie]);

  const rollDamage = useCallback((damageString: string, isCritical: boolean = false): { roll: number; details: string } => {
    const diceMatch = damageString.match(/(\d+)?d(\d+)/);
    if (!diceMatch) return { roll: 0, details: '' };

    const numDice = parseInt(diceMatch[1] || '1');
    const sides = parseInt(diceMatch[2]);
    
    let rolls: number[] = [];
    for (let i = 0; i < numDice; i++) {
      rolls.push(rollDie(sides));
    }
    
    // Double dice on critical hit
    if (isCritical) {
      for (let i = 0; i < numDice; i++) {
        rolls.push(rollDie(sides));
      }
    }
    
    const total = rolls.reduce((sum, roll) => sum + roll, 0);
    const details = isCritical ? rolls.join('+') : rolls.join('+');
    
    return { roll: total, details };
  }, [rollDie]);

  const rollDamageBonusDice = useCallback((bonusString: string, isCritical: boolean = false): { roll: number; details: string } => {
    const diceMatch = bonusString.match(/d(\d+)/);
    if (!diceMatch) {
      // It's a fixed number
      const bonus = parseInt(bonusString) || 0;
      return { roll: bonus, details: bonus.toString() };
    }

    const sides = parseInt(diceMatch[1]);
    const roll1 = rollDie(sides);
    const roll2 = isCritical ? rollDie(sides) : 0;
    const total = roll1 + roll2;
    
    const details = isCritical ? `${roll1}+${roll2}` : roll1.toString();
    
    return { roll: total, details: `${bonusString}(${details})` };
  }, [rollDie]);

  const showRollResult = useCallback((result: string) => {
    setLastResult(result);
  }, []);

  const clearRollResult = useCallback(() => {
    setLastResult(null);
  }, []);

  return {
    rollDie,
    rollD20,
    rollDamage,
    rollDamageBonusDice,
    lastResult,
    showRollResult,
    clearRollResult
  };
}