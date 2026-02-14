import { ItemData, Ability } from '../types';
import { EditableStatField } from './EditableStatField';
import { EditableAbilityField } from './EditableAbilityField';
import { DiceButton } from './ui/dice';
import { RollMode } from '../hooks/useDice';

interface WeaponCardProps {
  weapon: ItemData;
  abilities: Ability[];
  weaponBonuses: Record<string, number>;
  weaponAbilities?: Record<string, string>;
  onUpdateWeaponBonuses: (bonuses: Record<string, number>) => void;
  onUpdateWeaponAbilities?: (abilities: Record<string, string>) => void;
  onRoll: (weapon: ItemData, mode: RollMode) => void;
}

export function WeaponCard({ 
  weapon, 
  weaponBonuses, 
  weaponAbilities = {},
  onUpdateWeaponBonuses, 
  onUpdateWeaponAbilities,
  onRoll 
}: WeaponCardProps) {
  return (
    <div className="border-2 border-black p-3 bg-white">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex-1">
          <div className="font-black">{weapon.name}</div>
          <div className="text-sm text-gray-600">
            Damage: {weapon.damage}{weapon.damageBonus ? ` + ${weapon.damageBonus}` : ''}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <EditableStatField
            value={weaponBonuses[weapon.id] ?? weapon.attackBonus ?? 0}
            onUpdate={(value) => onUpdateWeaponBonuses({ ...weaponBonuses, [weapon.id]: value })}
            className="text-sm text-right w-8"
            min={-99}
          />
          <span>+</span>
          {onUpdateWeaponAbilities ? (
            <EditableAbilityField
              value={weaponAbilities[weapon.id] || weapon.weaponAbility || 'STR'}
              onUpdate={(value) => onUpdateWeaponAbilities({ ...weaponAbilities, [weapon.id]: value })}
              className="text-sm"
            />
          ) : (
            <span className="text-sm">{weapon.weaponAbility || 'STR'}</span>
          )}
        </div>
        <DiceButton onRoll={(mode) => onRoll(weapon, mode)}>
          Roll
        </DiceButton>
      </div>
    </div>
  );
}

interface WeaponListProps {
  weapons: ItemData[];
  abilities: Ability[];
  weaponBonuses: Record<string, number>;
  weaponAbilities?: Record<string, string>;
  onUpdateWeaponBonuses: (bonuses: Record<string, number>) => void;
  onUpdateWeaponAbilities?: (abilities: Record<string, string>) => void;
  onRoll: (weapon: ItemData, mode: RollMode) => void;
  emptyMessage?: string;
}

export function WeaponList({ 
  weapons, 
  abilities,
  weaponBonuses, 
  weaponAbilities,
  onUpdateWeaponBonuses, 
  onUpdateWeaponAbilities,
  onRoll,
  emptyMessage = "No equipped weapons"
}: WeaponListProps) {
  if (weapons.length === 0) {
    return <p className="text-gray-500 italic">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2">
      {weapons.map((weapon) => (
        <WeaponCard
          key={weapon.id}
          weapon={weapon}
          abilities={abilities}
          weaponBonuses={weaponBonuses}
          weaponAbilities={weaponAbilities}
          onUpdateWeaponBonuses={onUpdateWeaponBonuses}
          onUpdateWeaponAbilities={onUpdateWeaponAbilities}
          onRoll={onRoll}
        />
      ))}
    </div>
  );
}