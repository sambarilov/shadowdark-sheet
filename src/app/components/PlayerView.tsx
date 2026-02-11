import { useState } from 'react';
import { Sword, Sparkles, Dices, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Weapon {
  id: string;
  name: string;
  damage: string;
  equipped: boolean;
}

interface Spell {
  id: string;
  name: string;
  level: number;
  description: string;
}

interface PlayerViewProps {
  hp: number;
  maxHp: number;
  ac: number;
  weapons: Weapon[];
  spells: Spell[];
  onUpdateHP: (hp: number) => void;
  onUpdateMaxHP: (maxHp: number) => void;
}

export function PlayerView({ hp, maxHp, ac, weapons, spells, onUpdateHP, onUpdateMaxHP }: PlayerViewProps) {
  const [rollResult, setRollResult] = useState<string | null>(null);
  const [editingHP, setEditingHP] = useState(false);
  const [editingMaxHP, setEditingMaxHP] = useState(false);

  const rollDice = (sides: number) => {
    return Math.floor(Math.random() * sides) + 1;
  };

  const handleAttackRoll = (weapon: Weapon) => {
    const attackRoll = rollDice(20);
    const damageRoll = rollDice(parseInt(weapon.damage.match(/\d+/)?.[0] || '6'));
    setRollResult(`${weapon.name}: Attack ${attackRoll}, Damage ${damageRoll}`);
    setTimeout(() => setRollResult(null), 3000);
  };

  const handleCastingRoll = (spell: Spell) => {
    const castRoll = rollDice(20);
    setRollResult(`${spell.name}: Cast Roll ${castRoll}`);
    setTimeout(() => setRollResult(null), 3000);
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
        <div className="mb-4 border-4 border-black bg-black text-white p-4 text-center animate-in fade-in">
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
              <div key={weapon.id} className="border-2 border-black p-3 bg-white flex items-center justify-between">
                <div>
                  <div className="font-black">{weapon.name}</div>
                  <div className="text-sm text-gray-600">Damage: {weapon.damage}</div>
                </div>
                <Button
                  onClick={() => handleAttackRoll(weapon)}
                  className="bg-black text-white hover:bg-gray-800 border-2 border-black"
                  size="sm"
                >
                  <Dices size={16} className="mr-1" />
                  Roll
                </Button>
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
                  <Button
                    onClick={() => handleCastingRoll(spell)}
                    className="bg-black text-white hover:bg-gray-800 border-2 border-black"
                    size="sm"
                  >
                    <Dices size={16} className="mr-1" />
                    Cast
                  </Button>
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