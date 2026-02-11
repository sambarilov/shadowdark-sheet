import { useState } from 'react';
import { User, Star, Dices, Sparkles, Plus, Trash2, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { EditAbilitiesDialog } from './EditAbilitiesDialog';
import { EditTalentDialog } from './EditTalentDialog';

export interface CharacterAttribute {
  name: string;
  value: string;
}

export interface Talent {
  id: string;
  name: string;
  description: string;
}

export interface Ability {
  name: string;
  shortName: string;
  score: number;
  bonus: number;
}

interface CharacterAttributesViewProps {
  attributes: CharacterAttribute[];
  talents: Talent[];
  abilities: Ability[];
  luckTokenUsed: boolean;
  onToggleLuckToken: () => void;
  onUpdateAbilities: (abilities: Ability[]) => void;
  onAddTalent: (talent: Talent) => void;
  onRemoveTalent: (id: string) => void;
}

export function CharacterAttributesView({ 
  attributes, 
  talents, 
  abilities,
  luckTokenUsed,
  onToggleLuckToken,
  onUpdateAbilities,
  onAddTalent,
  onRemoveTalent
}: CharacterAttributesViewProps) {
  const [rollResult, setRollResult] = useState<string | null>(null);
  const [showAbilitiesDialog, setShowAbilitiesDialog] = useState(false);
  const [showTalentDialog, setShowTalentDialog] = useState(false);

  const rollDice = (sides: number) => {
    return Math.floor(Math.random() * sides) + 1;
  };

  const handleAbilityRoll = (ability: Ability) => {
    const roll = rollDice(20);
    const total = roll + ability.bonus;
    setRollResult(`${ability.shortName}: ${roll} ${ability.bonus >= 0 ? '+' : ''}${ability.bonus} = ${total}`);
    setTimeout(() => setRollResult(null), 3000);
  };

  return (
    <div className="flex flex-col">
      {/* Roll Result Popup */}
      {rollResult && (
        <div className="mb-4 border-4 border-black bg-black text-white p-4 text-center animate-in fade-in">
          <Dices className="inline-block mr-2" size={20} />
          {rollResult}
        </div>
      )}

      {/* Luck Token */}
      <div className="mb-4">
        <Button
          onClick={onToggleLuckToken}
          className={`w-full h-14 border-4 border-black ${
            luckTokenUsed 
              ? 'bg-gray-300 text-gray-600 line-through' 
              : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          <Sparkles size={20} className="mr-2" />
          <span className="font-black uppercase">
            Luck Token {luckTokenUsed ? '(Used)' : '(Available)'}
          </span>
        </Button>
      </div>

      {/* Abilities Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-black uppercase">Abilities</h2>
          <Button
            onClick={() => setShowAbilitiesDialog(true)}
            size="sm"
            variant="outline"
            className="border-2 border-black"
          >
            <Edit size={16} />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {abilities.map((ability) => (
            <button
              key={ability.shortName}
              onClick={() => handleAbilityRoll(ability)}
              className="border-2 border-black p-2 bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <div className="text-xs font-black uppercase">{ability.shortName}</div>
              <div className="text-2xl font-black">{ability.score}</div>
              <div className="text-sm text-gray-600">
                {ability.bonus >= 0 ? '+' : ''}{ability.bonus}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Attributes Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <User size={20} />
          <h2 className="text-xl font-black uppercase">Character</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {attributes.map((attr, index) => (
            <div key={index} className="border-2 border-black p-2 bg-white">
              <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">
                {attr.name}
              </div>
              <div className="font-black text-sm">{attr.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Talents Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star size={20} />
            <h2 className="text-xl font-black uppercase">Talents</h2>
          </div>
          <Button
            onClick={() => setShowTalentDialog(true)}
            size="sm"
            className="bg-black text-white border-2 border-black"
          >
            <Plus size={16} className="mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {talents.length === 0 ? (
            <p className="text-gray-500 italic">No talents</p>
          ) : (
            talents.map((talent) => (
              <div key={talent.id} className="border-2 border-black p-3 bg-white group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-black mb-1">{talent.name}</div>
                    <p className="text-sm text-gray-600">{talent.description}</p>
                  </div>
                  <Button
                    onClick={() => onRemoveTalent(talent.id)}
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <EditAbilitiesDialog
        open={showAbilitiesDialog}
        onClose={() => setShowAbilitiesDialog(false)}
        abilities={abilities}
        onSave={onUpdateAbilities}
      />

      <EditTalentDialog
        open={showTalentDialog}
        onClose={() => setShowTalentDialog(false)}
        onSave={onAddTalent}
      />
    </div>
  );
}