import { useState } from 'react';
import { Sword, Sparkles, Dices } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu';

interface Weapon {
  id: string;
  name: string;
  damage: string;
  weaponAbility: string;
  equipped: boolean;
}

interface Spell {
  id: string;
  name: string;
  level: number;
  description: string;
}

interface Ability {
  name: string;
  shortName: string;
  score: number;
  bonus: number;
}

interface PlayerViewProps {
  hp: number;
  maxHp: number;
  ac: number;
  weapons: Weapon[];
  spells: Spell[];
  abilities: Ability[];
  onUpdateHP: (hp: number) => void;
  onUpdateMaxHP: (maxHp: number) => void;
}

export function PlayerView({ hp, maxHp, ac, weapons, spells, abilities, onUpdateHP, onUpdateMaxHP }: PlayerViewProps) {
  const [rollResult, setRollResult] = useState<string | null>(null);
  const [editingHP, setEditingHP] = useState(false);
  const [editingMaxHP, setEditingMaxHP] = useState(false);
  const [weaponAbilities, setWeaponAbilities] = useState<Record<string, string>>({});

  const rollDice = (sides: number) => {
    return Math.floor(Math.random() * sides) + 1;
  };

  const handleAttackRoll = (weapon: Weapon, mode: 'normal' | 'advantage' | 'disadvantage' = 'normal') => {
    // Get selected ability or default to weapon's ability
    const selectedAbility = weaponAbilities[weapon.id] || weapon.weaponAbility;
    const ability = abilities.find(a => a.shortName === selectedAbility);
    const abilityBonus = ability?.bonus || 0;
    
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
    
    const attackTotal = attackRoll + abilityBonus;
    const attackBonusText = abilityBonus !== 0 ? ` ${abilityBonus >= 0 ? '+' : ''}${abilityBonus}` : '';
    const attackTotalText = abilityBonus !== 0 ? ` = ${attackTotal}` : '';
    
    // Roll damage
    const damageDieMatch = weapon.damage.match(/d(\d+)/);
    const damageDie = damageDieMatch ? parseInt(damageDieMatch[1]) : 6;
    const damageRoll = rollDice(damageDie);
    const damageTotal = damageRoll + abilityBonus;
    const damageBonusText = abilityBonus !== 0 ? ` ${abilityBonus >= 0 ? '+' : ''}${abilityBonus}` : '';
    const damageTotalText = abilityBonus !== 0 ? ` = ${damageTotal}` : '';
    
    const modeText = mode === 'advantage' ? ' (ADV)' : mode === 'disadvantage' ? ' (DIS)' : '';
    setRollResult(`${weapon.name}${modeText}: Attack ${attackRoll}${attackRollDetails}${attackBonusText}${attackTotalText} | Damage ${damageRoll}${damageBonusText}${damageTotalText}`);
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
    setRollResult(`${spell.name}${modeText}: ${castRoll}${rollDetails}`);
  };

  const equippedWeapons = weapons.filter(w => w.equipped);

  return (
    <div className="h-full flex flex-col">
      {/* Header Stats */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 border-4 border-black p-4 bg-white">
          <div className="text-xs uppercase tracking-wider mb-1">Hit Points</div>
          <div className="flex items-center gap-2">
            {editingHP ? (
              <Input
                type="number"
                value={hp}
                onChange={(e) => onUpdateHP(parseInt(e.target.value) || 0)}
                onBlur={() => setEditingHP(false)}
                className="w-16 text-2xl font-black border-2 border-black p-1"
                autoFocus
                min={0}
              />
            ) : (
              <div 
                className="text-3xl font-black cursor-pointer hover:text-gray-600"
                onClick={() => setEditingHP(true)}
              >
                {hp}
              </div>
            )}
            <span className="text-lg">/</span>
            {editingMaxHP ? (
              <Input
                type="number"
                value={maxHp}
                onChange={(e) => onUpdateMaxHP(parseInt(e.target.value) || 1)}
                onBlur={() => setEditingMaxHP(false)}
                className="w-16 text-lg font-black border-2 border-black p-1"
                autoFocus
                min={1}
              />
            ) : (
              <div 
                className="text-lg font-black cursor-pointer hover:text-gray-600"
                onClick={() => setEditingMaxHP(true)}
              >
                {maxHp}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 border-4 border-black p-4 bg-white">
          <div className="text-xs uppercase tracking-wider mb-1">Armor Class</div>
          <div className="text-3xl font-black">{ac}</div>
        </div>
      </div>

      {/* Roll Result Popup */}
      {rollResult && (
        <div 
          onClick={() => setRollResult(null)}
          className="mb-4 border-4 border-black bg-black text-white p-4 text-center animate-in fade-in cursor-pointer"
        >
          <Dices className="inline-block mr-2" size={20} />
          {rollResult}
        </div>
      )}

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
                    <div className="text-sm text-gray-600">Damage: {weapon.damage}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={weaponAbilities[weapon.id] || weapon.weaponAbility}
                      onValueChange={(value) => setWeaponAbilities({ ...weaponAbilities, [weapon.id]: value })}
                    >
                      <SelectTrigger className="h-8 w-20 text-xs border-2 border-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STR">STR</SelectItem>
                        <SelectItem value="DEX">DEX</SelectItem>
                      </SelectContent>
                    </Select>
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

      {/* Spells Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={20} />
          <h2 className="text-xl font-black uppercase">Spells</h2>
        </div>
        <div className="space-y-2">
          {spells.length === 0 ? (
            <p className="text-gray-500 italic">No spells available</p>
          ) : (
            spells.map((spell) => (
              <div key={spell.id} className="border-2 border-black p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-black">{spell.name}</span>
                    <span className="ml-2 text-xs bg-black text-white px-2 py-1">
                      LVL {spell.level}
                    </span>
                  </div>
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <Button
                        onClick={() => handleCastingRoll(spell)}
                        className="bg-black text-white hover:bg-gray-800 border-2 border-black"
                        size="sm"
                      >
                        <Dices size={16} className="mr-1" />
                        Cast
                      </Button>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => handleCastingRoll(spell, 'advantage')}>
                        Roll with Advantage
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleCastingRoll(spell, 'disadvantage')}>
                        Roll with Disadvantage
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </div>
                <p className="text-sm text-gray-600">{spell.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}