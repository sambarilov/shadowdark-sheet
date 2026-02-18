import { useState } from 'react';
import { Sword, Sparkles, Dices, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { EditableStatField } from './EditableStatField';
import { EditableAbilityField } from './EditableAbilityField';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu';
import type { Ability } from '../types';
import { abilityModifier } from '../characterUtils';

interface Weapon {
  id: string;
  name: string;
  damage: string;
  weaponAbility: string;
  equipped: boolean;
  attackBonus?: number;
  damageBonus?: string;
}

interface Spell {
  id: string;
  name: string;
  level: number;
  duration: string;
  range: string;
  description: string;
  active: boolean;
}

interface PlayerViewProps {
  hp: number;
  maxHp: number;
  ac: number;
  acBonus: number;
  weapons: Weapon[];
  spells: Spell[];
  abilities: Record<string, Ability>;
  weaponBonuses: Record<string, number>;
  notes: string;
  onUpdateHP: (hp: number) => void;
  onUpdateMaxHP: (maxHp: number) => void;
  onUpdateAcBonus: (acBonus: number) => void;
  onToggleSpell: (id: string) => void;
  onRemoveSpell: (id: string) => void;
  onUpdateWeaponBonuses: (bonuses: Record<string, number>) => void;
  onUpdateNotes: (notes: string) => void;  onOpenSpellDialog: (spell?: Spell) => void;
  onShowRollResult: (result: string) => void;
}

export function PlayerView({ hp, maxHp, ac, acBonus, weapons, spells, abilities, weaponBonuses, notes, onUpdateHP, onUpdateMaxHP, onUpdateAcBonus, onToggleSpell, onRemoveSpell, onUpdateWeaponBonuses, onUpdateNotes, onOpenSpellDialog, onShowRollResult }: PlayerViewProps) {
  const [weaponAbilities, setWeaponAbilities] = useState<Record<string, string>>({});

  const rollDice = (sides: number) => {
    return Math.floor(Math.random() * sides) + 1;
  };

  const handleAttackRoll = (weapon: Weapon, mode: 'normal' | 'advantage' | 'disadvantage' = 'normal') => {
    // Get selected ability or default to weapon's ability
    const selectedAbility = weaponAbilities[weapon.id] || weapon.weaponAbility;
    const ability = abilities[selectedAbility];
    const abilityBonus = abilityModifier(ability.score);

    // Get weapon attack bonus
    const weaponBonus = weaponBonuses[weapon.id] ?? weapon.attackBonus ?? 0;
    const totalBonus = abilityBonus + weaponBonus;

    // Roll attack
    let attackRoll: number;
    let attackRollDetails = '';

    if (mode === 'advantage') {
      const roll1 = rollDice(20);
      const roll2 = rollDice(20);
      attackRoll = Math.max(roll1, roll2);
      attackRollDetails = ` [${roll1}, ${roll2}]`;
    } else if (mode === 'disadvantage') {
      const roll1 = rollDice(20);
      const roll2 = rollDice(20);
      attackRoll = Math.min(roll1, roll2);
      attackRollDetails = ` [${roll1}, ${roll2}]`;
    } else {
      attackRoll = rollDice(20);
    }

    const attackTotal = attackRoll + totalBonus;
    const attackBonusText = totalBonus !== 0 ? ` ${totalBonus >= 0 ? '+' : ''}${totalBonus}` : '';
    const attackTotalText = totalBonus !== 0 ? ` = ${attackTotal}` : '';

    // Check for critical hit (natural 20)
    const isCritical = attackRoll === 20;

    // Roll damage
    const damageDieMatch = weapon.damage.match(/d(\d+)/);
    const damageDie = damageDieMatch ? parseInt(damageDieMatch[1]) : 6;
    const damageRoll1 = rollDice(damageDie);
    const damageRoll2 = isCritical ? rollDice(damageDie) : 0;
    const damageRoll = damageRoll1 + damageRoll2;
    
    // Handle damage bonus (can be a number or dice roll like "1d4")
    let damageBonusValue = 0;
    let damageBonusText = '';
    if (weapon.damageBonus) {
      const bonusDiceMatch = weapon.damageBonus.match(/d(\d+)/);
      if (bonusDiceMatch) {
        // It's a dice roll
        const bonusDie = parseInt(bonusDiceMatch[1]);
        const bonusRoll1 = rollDice(bonusDie);
        const bonusRoll2 = isCritical ? rollDice(bonusDie) : 0;
        damageBonusValue = bonusRoll1 + bonusRoll2;
        if (isCritical) {
          damageBonusText = ` + ${weapon.damageBonus}(${bonusRoll1}+${bonusRoll2})`;
        } else {
          damageBonusText = ` + ${weapon.damageBonus}(${bonusRoll1})`;
        }
      } else {
        // It's a number
        damageBonusValue = parseInt(weapon.damageBonus) || 0;
        if (damageBonusValue !== 0) {
          damageBonusText = ` ${damageBonusValue >= 0 ? '+' : ''}${damageBonusValue}`;
        }
      }
    }
    
    const damageTotal = damageRoll + damageBonusValue;
    const damageTotalText = damageBonusValue !== 0 ? ` = ${damageTotal}` : '';
    const criticalText = isCritical ? ' CRITICAL HIT!' : '';
    const damageRollText = isCritical ? `${damageRoll1}+${damageRoll2}` : `${damageRoll}`;

    const modeText = mode === 'advantage' ? ' (ADV)' : mode === 'disadvantage' ? ' (DIS)' : '';
    onShowRollResult(`${weapon.name}${modeText}: Attack ${attackRoll}${attackRollDetails}${attackBonusText}${attackTotalText}${criticalText} | Damage ${damageRollText}${damageBonusText}${damageTotalText}`);
  };

  const handleCastingRoll = (spell: Spell, mode: 'normal' | 'advantage' | 'disadvantage' = 'normal') => {
    let castRoll: number;
    let rollDetails = '';

    if (mode === 'advantage') {
      const roll1 = rollDice(20);
      const roll2 = rollDice(20);
      castRoll = Math.max(roll1, roll2);
      rollDetails = ` [${roll1}, ${roll2}]`;
    } else if (mode === 'disadvantage') {
      const roll1 = rollDice(20);
      const roll2 = rollDice(20);
      castRoll = Math.min(roll1, roll2);
      rollDetails = ` [${roll1}, ${roll2}]`;
    } else {
      castRoll = rollDice(20);
    }

    const modeText = mode === 'advantage' ? ' (ADV)' : mode === 'disadvantage' ? ' (DIS)' : '';
    onShowRollResult(`${spell.name}${modeText}: ${castRoll}${rollDetails}`);
  };

  const equippedWeapons = weapons.filter(w => w.equipped);

  return (
    <>
      <div className="h-full flex flex-col relative">

      {/* Header Stats */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 border-4 border-black p-4 bg-white flex flex-col items-center justify-center">
          <div className="text-xs uppercase tracking-wider mb-1">Hit Points</div>
          <div className="flex items-center gap-2">
            <EditableStatField
              value={hp}
              onUpdate={onUpdateHP}
              className="text-3xl font-black"
              min={0}
            />
            <span className="text-lg">/</span>
            <EditableStatField
              value={maxHp}
              onUpdate={onUpdateMaxHP}
              className="text-lg font-black"
              min={1}
            />
          </div>
        </div>
        <div className="flex-1 border-4 border-black p-4 bg-white flex flex-col items-center justify-center">
          <div className="text-xs uppercase tracking-wider mb-1">Armor Class</div>
          <div className="flex items-center gap-1">
            <div className="text-3xl font-black">{ac}</div>
            <div className="flex items-center text-sm text-gray-600">
              <span>(</span>
              <EditableStatField
                value={acBonus}
                onUpdate={onUpdateAcBonus}
                className="text-sm font-black w-8 text-center"
                min={-99}
              />
              <span>)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weapons Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sword size={20} />
          <h2 className="text-xl font-black uppercase">Attacks</h2>
        </div>
        <div className="space-y-2">
          {equippedWeapons.length === 0 ? (
            <p className="text-gray-500 italic">No equipped weapons</p>
          ) : (
            equippedWeapons.map((weapon) => (
              <div key={weapon.id} className="border-2 border-black p-3 bg-white">
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
                    <EditableAbilityField
                      value={weaponAbilities[weapon.id] || weapon.weaponAbility}
                      onUpdate={(value) => setWeaponAbilities({ ...weaponAbilities, [weapon.id]: value })}
                      className="text-sm"
                    />
                  </div>
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <Button
                        onClick={() => handleAttackRoll(weapon)}
                        className="bg-black text-white hover:bg-gray-800 border-2 border-black"
                        size="sm"
                      >
                        <Dices size={16} className="mr-1" />
                        Roll
                      </Button>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => handleAttackRoll(weapon, 'advantage')}>
                        Roll with Advantage
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleAttackRoll(weapon, 'disadvantage')}>
                        Roll with Disadvantage
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Notes Section */}
      <div className="mb-6">
        <h2 className="text-xl font-black uppercase mb-3">Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => onUpdateNotes(e.target.value)}
          placeholder="Add notes here..."
          className="w-full min-h-[100px] p-3 border-2 border-black bg-white resize-y font-mono text-sm"
        />
      </div>

      {/* Spells Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={20} />
            <h2 className="text-xl font-black uppercase">Spells</h2>
          </div>
          <Button
            onClick={() => onOpenSpellDialog()}
            size="sm"
            variant="outline"
            className="border-2 border-black"
          >
            <Plus size={16} />
          </Button>
        </div>
        <div className="space-y-2">
          {spells.length === 0 ? (
            <p className="text-gray-500 italic">No spells available</p>
          ) : (
            spells.map((spell) => (
              <ContextMenu key={spell.id}>
                <ContextMenuTrigger asChild>
                  <div className="border-2 border-black p-3 bg-white cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => onToggleSpell(spell.id)}
                          className={`h-8 px-3 border-2 border-black ${spell.active
                              ? 'bg-white text-black hover:bg-gray-100'
                              : 'bg-gray-300 text-gray-600 line-through'
                            }`}
                          size="sm"
                        >
                          <span className="font-black text-xs">
                            {spell.active ? 'READY' : 'FAILED'}
                          </span>
                        </Button>
                        <span className="font-black">{spell.name}</span>
                        <span className="text-xs bg-black text-white px-2 py-1">
                          LVL {spell.level}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleCastingRoll(spell)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="bg-black text-white hover:bg-gray-800 border-2 border-black"
                        size="sm"
                        disabled={!spell.active}
                      >
                        <Dices size={16} className="mr-1" />
                        Cast
                      </Button>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {spell.range && <span>Range: {spell.range}</span>}
                      {spell.range && spell.duration && <span className="mx-2">|</span>}
                      {spell.duration && <span>Duration: {spell.duration}</span>}
                    </div>
                    <p className="text-sm text-gray-600">{spell.description}</p>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => {
                    onOpenSpellDialog(spell);
                  }}>
                    Edit Spell
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onRemoveSpell(spell.id)} className="text-red-600">
                    Delete Spell
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))
          )}
        </div>
      </div>
    </div>
    </>
  );
}