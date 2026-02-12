import { useState } from 'react';
import { User, Star, Dices, Sparkles, Plus, Edit, Upload, Download } from 'lucide-react';
import { Button } from './ui/button';
import { EditableStatField } from './EditableStatField';
import { EditAbilitiesDialog } from './EditAbilitiesDialog';
import { EditTalentDialog } from './EditTalentDialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu';

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
  currentXP: number;
  totalXP: number;
  languages: string;
  characterImported: boolean;
  onToggleLuckToken: () => void;
  onUpdateXP: (current: number, total: number) => void;
  onUpdateLanguages: (languages: string) => void;
  onUpdateAttributes: (attributes: CharacterAttribute[]) => void;
  onUpdateAbilities: (abilities: Ability[]) => void;
  onAddTalent: (talent: Talent) => void;
  onRemoveTalent: (id: string) => void;
  onImportCharacter: () => void;
  onExportCharacter: () => void;
}

export function CharacterAttributesView({ 
  attributes, 
  talents, 
  abilities,
  luckTokenUsed,
  currentXP,
  totalXP,
  languages,
  characterImported,
  onToggleLuckToken,
  onUpdateXP,
  onUpdateLanguages,
  onUpdateAttributes,
  onUpdateAbilities,
  onAddTalent,
  onRemoveTalent,
  onImportCharacter,
  onExportCharacter
}: CharacterAttributesViewProps) {
  const [rollResult, setRollResult] = useState<string | null>(null);
  const [showAbilitiesDialog, setShowAbilitiesDialog] = useState(false);
  const [showTalentDialog, setShowTalentDialog] = useState(false);
  const [editingTalent, setEditingTalent] = useState<Talent | undefined>(undefined);

  const rollDice = (sides: number) => {
    return Math.floor(Math.random() * sides) + 1;
  };

  const handleAbilityRoll = (ability: Ability, mode: 'normal' | 'advantage' | 'disadvantage' = 'normal') => {
    let roll: number;
    let rollDetails = '';
    
    if (mode === 'advantage') {
      const roll1 = rollDice(20);
      const roll2 = rollDice(20);
      roll = Math.max(roll1, roll2);
      rollDetails = ` [${roll1}, ${roll2}]`;
    } else if (mode === 'disadvantage') {
      const roll1 = rollDice(20);
      const roll2 = rollDice(20);
      roll = Math.min(roll1, roll2);
      rollDetails = ` [${roll1}, ${roll2}]`;
    } else {
      roll = rollDice(20);
    }
    
    const total = roll + ability.bonus;
    const modeText = mode === 'advantage' ? ' (ADV)' : mode === 'disadvantage' ? ' (DIS)' : '';
    const bonusText = ability.bonus !== 0 ? ` ${ability.bonus >= 0 ? '+' : ''}${ability.bonus}` : '';
    const totalText = ability.bonus !== 0 ? ` = ${total}` : '';
    setRollResult(`${ability.shortName}${modeText}: ${roll}${rollDetails}${bonusText}${totalText}`);
  };

  return (
    <>
      {/* Roll Result Popup - Floating */}
      {rollResult && (
        <div
          onClick={() => setRollResult(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          <div className="border-4 border-black bg-black text-white p-6 text-center animate-in fade-in cursor-pointer shadow-2xl max-w-md pointer-events-auto">
            <Dices className="inline-block mr-2" size={20} />
            {rollResult}
          </div>
        </div>
      )}

      <div className="flex flex-col relative">

      {/* Attributes Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <User size={20} />
            <h2 className="text-xl font-black uppercase">Character</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onImportCharacter}
              size="sm"
              variant="outline"
              className="border-2 border-black"
              title="Import Character"
            >
              <Upload size={16} />
            </Button>
            <Button
              onClick={onExportCharacter}
              size="sm"
              variant="outline"
              className="border-2 border-black"
              title="Export Character"
            >
              <Download size={16} />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {attributes.map((attr, index) => (
            <div key={index} className="border-2 border-black p-2 bg-white">
              <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">
                {attr.name}
              </div>
              <input
                type="text"
                value={attr.value}
                onChange={(e) => {
                  const newAttributes = [...attributes];
                  newAttributes[index] = { ...attr, value: e.target.value };
                  onUpdateAttributes(newAttributes);
                }}
                className="w-full font-black text-sm bg-transparent border-none focus:outline-none focus:ring-0 p-0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Languages Section */}
      <div className="mb-4">
        <div className="border-2 border-black p-3 bg-white">
          <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">Languages</div>
          <input
            type="text"
            value={languages}
            onChange={(e) => onUpdateLanguages(e.target.value)}
            className="w-full font-black text-sm bg-transparent border-none focus:outline-none focus:ring-0 p-0"
            placeholder="Enter languages..."
          />
        </div>
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
            <ContextMenu key={ability.shortName}>
              <ContextMenuTrigger asChild>
                <button
                  onClick={() => handleAbilityRoll(ability)}
                  className="border-2 border-black p-2 bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <div className="text-xs font-black uppercase">{ability.shortName}</div>
                  <div className="text-2xl font-black">{ability.score}</div>
                  <div className="text-sm text-gray-600">
                    {ability.bonus >= 0 ? '+' : ''}{ability.bonus}
                  </div>
                </button>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => handleAbilityRoll(ability, 'advantage')}>
                  Roll with Advantage
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleAbilityRoll(ability, 'disadvantage')}>
                  Roll with Disadvantage
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </div>

      {/* Luck Token and XP */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="h-14 border-4 border-black bg-white flex flex-col items-center justify-center">
          <div className="text-xs uppercase tracking-wider text-gray-600">Experience</div>
          <div className="flex items-center gap-1">
            <EditableStatField
              value={currentXP}
              onUpdate={(val) => onUpdateXP(val, totalXP)}
              className="text-lg font-black"
              min={0}
            />
            <span className="text-sm">/</span>
            <EditableStatField
              value={totalXP}
              onUpdate={(val) => onUpdateXP(currentXP, val)}
              className="text-lg font-black"
              min={1}
            />
          </div>
        </div>

        <Button
          onClick={onToggleLuckToken}
          className={`h-14 border-4 border-black ${
            luckTokenUsed 
              ? 'bg-gray-300 text-gray-600 line-through' 
              : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          <Sparkles size={20} className="mr-2" />
          <span className="font-black uppercase text-xs">
            Luck Token
          </span>
        </Button>
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
            variant="outline"
            className="border-2 border-black"
          >
            <Plus size={16} />
          </Button>
        </div>
        <div className="space-y-2">
          {talents.length === 0 ? (
            <p className="text-gray-500 italic">No talents</p>
          ) : (
            talents.map((talent) => (
              <ContextMenu key={talent.id}>
                <ContextMenuTrigger asChild>
                  <div className="border-2 border-black p-3 bg-white group cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-black mb-1">{talent.name}</div>
                        <p className="text-sm text-gray-600">{talent.description}</p>
                      </div>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => {
                    setEditingTalent(talent);
                    setShowTalentDialog(true);
                  }}>
                    Edit Talent
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onRemoveTalent(talent.id)} className="text-red-600">
                    Delete Talent
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
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
        talent={editingTalent}
        onClose={() => {
          setShowTalentDialog(false);
          setEditingTalent(undefined);
        }}
        onSave={(talent) => {
          onAddTalent(talent);
          setShowTalentDialog(false);
          setEditingTalent(undefined);
        }}
      />
    </div>
    </>
  );
}