import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { Ability } from './CharacterAttributesView';

interface EditAbilitiesDialogProps {
  open: boolean;
  onClose: () => void;
  abilities: Ability[];
  onSave: (abilities: Ability[]) => void;
}

export function EditAbilitiesDialog({ open, onClose, abilities, onSave }: EditAbilitiesDialogProps) {
  const [editedAbilities, setEditedAbilities] = useState(abilities);

  const handleScoreChange = (index: number, score: number) => {
    const newAbilities = [...editedAbilities];
    // Calculate bonus: (score - 10) / 2, rounded down
    const bonus = Math.floor((score - 10) / 2);
    newAbilities[index] = { ...newAbilities[index], score, bonus };
    setEditedAbilities(newAbilities);
  };

  const handleSave = () => {
    onSave(editedAbilities);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-4 border-black bg-white">
        <DialogHeader>
          <DialogTitle className="font-black uppercase">Edit Abilities</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {editedAbilities.map((ability, index) => (
            <div key={ability.shortName} className="grid grid-cols-2 gap-4 items-center">
              <Label className="font-black">{ability.name}</Label>
              <Input
                type="number"
                value={ability.score}
                onChange={(e) => handleScoreChange(index, parseInt(e.target.value) || 10)}
                className="border-2 border-black"
                min={1}
                max={20}
              />
            </div>
          ))}
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={onClose} variant="outline" className="border-2 border-black">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-black text-white border-2 border-black">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
