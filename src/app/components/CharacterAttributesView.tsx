import { useState } from 'react';
import { User, Star, Dices, Sparkles, Plus, Edit, Upload, Download } from 'lucide-react';
import { Button } from './ui/button';
import { EditableStatField } from './EditableStatField';
import { EditAbilitiesDialog } from './dialogs/EditAbilitiesDialog';
import { EditTalentDialog } from './dialogs/EditTalentDialog';
import { Attribute } from './character/Attribute';
import { formatModifier, abilityModifier } from '../characterUtils';
import { AbilityField } from './character/AbilityField';
import { TalentField } from './character/TalentField';
import type { Talent } from '../types';
import { Ability } from '../types';

export interface CharacterAttribute {
  name: string;
  value: string;
}

interface CharacterAttributesViewProps {
  attributes: {
    name: string;
    class: string;
    ancestry: string;
    level: number;
    background: string;
    alignment: string;
  };
  talents: Talent[];
  abilities: Record<string, Ability>;
  luckTokenUsed: boolean;
  currentXP: number;
  xpToNextLevel: number;
  languages: string;
  onToggleLuckToken: () => void;
  onUpdateXP: (current: number, xpToNextLevel: number) => void;
  onUpdateLanguages: (languages: string) => void;
  onUpdateAttribute: (name: string, value: string) => void;
  onUpdateAbilities: (abilities: Record<string, Ability>) => void;
  onAddTalent: (talent: Talent) => void;
  onUpdateTalent: (id: string, updates: Partial<Talent>) => void;
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
  xpToNextLevel,
  languages,
  onToggleLuckToken,
  onUpdateXP,
  onUpdateAttribute,
  onUpdateAbilities,
  onAddTalent,
  onUpdateTalent,
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
    
    const abilityBonus = abilityModifier(ability.score);
    const total = roll + abilityBonus;
    const modeText = mode === 'advantage' ? ' (ADV)' : mode === 'disadvantage' ? ' (DIS)' : '';
    const bonusText = abilityBonus !== 0 ? ` ${formatModifier(abilityBonus)}` : '';
    const totalText = abilityBonus !== 0 ? ` = ${total}` : '';
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
          {Object.keys(attributes).map((key: string, index: number) => (
            <Attribute
              key={index}
              name={key}
              value={attributes[key as keyof typeof attributes]}
              onChange={onUpdateAttribute}
              />
          ))}
        </div>
      </div>

      {/* Languages Section */}
      <div className="mb-4">
        <Attribute
          name={'Languages'}
          value={languages}
          onChange={(_, value) => onUpdateAttribute('languages', value)}
          />
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
          {Object.keys(abilities).map((key) => {
            const ability = abilities[key];
            return (
              <AbilityField
                key={key}
                ability={ability}
                onAbilityRoll={handleAbilityRoll}
              />
            );
          })}
        </div>
      </div>

      {/* Luck Token and XP */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="h-14 border-4 border-black bg-white flex flex-col items-center justify-center">
          <div className="text-xs uppercase tracking-wider text-gray-600">Experience</div>
          <div className="flex items-center gap-1">
            <EditableStatField
              value={currentXP}
              onUpdate={(val) => onUpdateXP(val, xpToNextLevel)}
              className="text-lg font-black"
              min={0}
            />
            <span className="text-sm">/</span>
            <EditableStatField
              value={xpToNextLevel}
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
              <TalentField
                key={talent.id}
                talent={talent}
                onRemoveTalent={() => onRemoveTalent(talent.id)}
                onEditTalent={() => {
                  setEditingTalent(talent);
                  setShowTalentDialog(true);
                }}
              />
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
          if (editingTalent) {
            onUpdateTalent(editingTalent.id, talent);
          } else {
            onAddTalent(talent);
          }
          setShowTalentDialog(false);
          setEditingTalent(undefined);
        }}
      />
    </div>
    </>
  );
}