import { useCallback } from 'react';
import { useDice, RollMode } from './useDice';
import { Ability, ItemData } from '../types';

export interface WeaponRollResult {
  weaponName: string;
  attackRoll: number;
  attackDetails: string;
  attackBonus: number;
  attackTotal: number;
  damageRoll: number;
  damageDetails: string;
  damageBonus: number;
  damageTotal: number;
  isCritical: boolean;
  mode: RollMode;
}

export function useCombat() {
  const { rollD20, rollDamage, rollDamageBonusDice, showRollResult } = useDice();

  const calculateAbilityBonus = useCallback((score: number): number => {
    return Math.floor((score - 10) / 2);
  }, []);

  const calculateArmorClass = useCallback((
    baseAC: number, 
    dexBonus: number, 
    armorAC?: number, 
    shieldBonus?: number, 
    acBonus: number = 0
  ): number => {
    // If wearing armor, use armor AC + DEX modifier (max +2 for medium armor, +0 for heavy)
    if (armorAC) {
      const maxDexBonus = armorAC <= 12 ? dexBonus : armorAC <= 14 ? Math.min(dexBonus, 2) : 0;
      return armorAC + maxDexBonus + (shieldBonus || 0) + acBonus;
    }
    // Otherwise use base AC (10) + DEX + bonuses
    return baseAC + dexBonus + (shieldBonus || 0) + acBonus;
  }, []);

  const performAttackRoll = useCallback((
    weapon: ItemData,
    abilities: Ability[],
    weaponBonuses: Record<string, number>,
    mode: RollMode = 'normal'
  ): WeaponRollResult => {
    // Get weapon ability and ability bonus
    const weaponAbility = weapon.weaponAbility || 'STR';
    const ability = abilities.find(a => a.shortName === weaponAbility);
    const abilityBonus = ability?.bonus || 0;

    // Get weapon attack bonus
    const weaponBonus = weaponBonuses[weapon.id] ?? weapon.attackBonus ?? 0;
    const totalAttackBonus = abilityBonus + weaponBonus;

    // Roll attack
    const { roll: attackRoll, details: attackDetails } = rollD20(mode);
    const attackTotal = attackRoll + totalAttackBonus;
    const isCritical = attackRoll === 20;

    // Roll damage
    const damageString = weapon.damage || '1d4';
    const { roll: baseDamage, details: baseDamageDetails } = rollDamage(damageString, isCritical);

    // Handle damage bonus
    let damageBonus = 0;
    if (weapon.damageBonus) {
      const { roll: bonusRoll } = rollDamageBonusDice(weapon.damageBonus, isCritical);
      damageBonus = bonusRoll;
    }

    const damageTotal = baseDamage + damageBonus;

    return {
      weaponName: weapon.name,
      attackRoll,
      attackDetails,
      attackBonus: totalAttackBonus,
      attackTotal,
      damageRoll: baseDamage,
      damageDetails: baseDamageDetails,
      damageBonus,
      damageTotal,
      isCritical,
      mode
    };
  }, [rollD20, rollDamage, rollDamageBonusDice]);

  const performAbilityCheck = useCallback((
    ability: Ability,
    mode: RollMode = 'normal'
  ): { roll: number; details: string; bonus: number; total: number; mode: RollMode } => {
    const { roll, details } = rollD20(mode);
    const total = roll + ability.bonus;

    return {
      roll,
      details,
      bonus: ability.bonus,
      total,
      mode
    };
  }, [rollD20]);

  const formatAttackResult = useCallback((result: WeaponRollResult): string => {
    const modeText = result.mode === 'advantage' ? ' (ADV)' : result.mode === 'disadvantage' ? ' (DIS)' : '';
    const attackBonusText = result.attackBonus !== 0 ? ` ${result.attackBonus >= 0 ? '+' : ''}${result.attackBonus}` : '';
    const attackTotalText = result.attackBonus !== 0 ? ` = ${result.attackTotal}` : '';
    const criticalText = result.isCritical ? ' CRITICAL HIT!' : '';
    const damageTotalText = result.damageBonus !== 0 ? ` = ${result.damageTotal}` : '';

    return `${result.weaponName}${modeText}: Attack ${result.attackRoll}${result.attackDetails}${attackBonusText}${attackTotalText}${criticalText} | Damage ${result.damageDetails}${result.damageBonus !== 0 ? ` + ${result.damageBonus}` : ''}${damageTotalText}`;
  }, []);

  const formatAbilityCheckResult = useCallback((
    result: { roll: number; details: string; bonus: number; total: number; mode: RollMode },
    abilityName: string
  ): string => {
    const modeText = result.mode === 'advantage' ? ' (ADV)' : result.mode === 'disadvantage' ? ' (DIS)' : '';
    const bonusText = result.bonus !== 0 ? ` ${result.bonus >= 0 ? '+' : ''}${result.bonus}` : '';
    const totalText = result.bonus !== 0 ? ` = ${result.total}` : '';

    return `${abilityName}${modeText}: ${result.roll}${result.details}${bonusText}${totalText}`;
  }, []);

  const rollWeaponAttack = useCallback((
    weapon: ItemData,
    abilities: Ability[],
    weaponBonuses: Record<string, number>,
    mode: RollMode = 'normal'
  ) => {
    const result = performAttackRoll(weapon, abilities, weaponBonuses, mode);
    const formattedResult = formatAttackResult(result);
    showRollResult(formattedResult);
    return result;
  }, [performAttackRoll, formatAttackResult, showRollResult]);

  const rollAbilityCheck = useCallback((
    ability: Ability,
    mode: RollMode = 'normal'
  ) => {
    const result = performAbilityCheck(ability, mode);
    const formattedResult = formatAbilityCheckResult(result, ability.shortName);
    showRollResult(formattedResult);
    return result;
  }, [performAbilityCheck, formatAbilityCheckResult, showRollResult]);

  const rollSpellCasting = useCallback((
    spellName: string,
    mode: RollMode = 'normal'
  ) => {
    const { roll, details } = rollD20(mode);
    const modeText = mode === 'advantage' ? ' (ADV)' : mode === 'disadvantage' ? ' (DIS)' : '';
    showRollResult(`${spellName}${modeText}: ${roll}${details}`);
    return { roll, details, mode };
  }, [rollD20, showRollResult]);

  return {
    calculateAbilityBonus,
    calculateArmorClass,
    rollWeaponAttack,
    rollAbilityCheck,
    rollSpellCasting,
    performAttackRoll,
    performAbilityCheck,
    formatAttackResult,
    formatAbilityCheckResult
  };
}