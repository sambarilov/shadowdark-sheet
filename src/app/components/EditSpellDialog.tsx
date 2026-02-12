import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export interface SpellData {
  id: string;
  name: string;
  level: number;
  duration: string;
  range: string;
  description: string;
  active: boolean;
}

interface EditSpellDialogProps {
  spell?: SpellData;
  onSave: (spell: SpellData) => void;
  onCancel: () => void;
}

export function EditSpellDialog({ spell, onSave, onCancel }: EditSpellDialogProps) {
  const [name, setName] = useState(spell?.name || '');
  const [level, setLevel] = useState(spell?.level || 1);
  const [duration, setDuration] = useState(spell?.duration || '');
  const [range, setRange] = useState(spell?.range || '');
  const [description, setDescription] = useState(spell?.description || '');

  const handleSave = () => {
    if (!name.trim()) return;

    const spellData: SpellData = {
      id: spell?.id || `spell-${Date.now()}`,
      name: name.trim(),
      level,
      duration: duration.trim(),
      range: range.trim(),
      description: description.trim(),
      active: spell?.active ?? true
    };

    onSave(spellData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white border-4 border-black p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-black uppercase mb-4">
          {spell ? 'Edit Spell' : 'Add New Spell'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold mb-1 block">Spell Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Magic Missile"
              className="border-2 border-black"
            />
          </div>

          <div>
            <label className="text-sm font-bold mb-1 block">Level</label>
            <Input
              type="number"
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value) || 1)}
              min={1}
              max={9}
              className="border-2 border-black"
            />
          </div>

          <div>
            <label className="text-sm font-bold mb-1 block">Duration</label>
            <Input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., Instant, 1 round, 10 minutes"
              className="border-2 border-black"
            />
          </div>

          <div>
            <label className="text-sm font-bold mb-1 block">Range</label>
            <Input
              value={range}
              onChange={(e) => setRange(e.target.value)}
              placeholder="e.g., Self, Touch, Near, Far"
              className="border-2 border-black"
            />
          </div>

          <div>
            <label className="text-sm font-bold mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Effect details..."
              className="w-full border-2 border-black p-2 min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            onClick={handleSave}
            className="flex-1 bg-black text-white hover:bg-gray-800"
          >
            Save
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-2 border-black"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
