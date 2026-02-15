import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { Ability } from '../CharacterAttributesView';

interface EditAbilitiesDialogProps {
  open: boolean;
  onClose: () => void;
  abilities: Record<string, Ability>;
  onSave: (abilities: Record<string, Ability>) => void;
}

export function EditAbilitiesDialog({ open, onClose, abilities, onSave }: EditAbilitiesDialogProps) {
  const [editedAbilities, setEditedAbilities] = useState(abilities);

  const handleScoreChange = (key: string, score: number) => {
    const newAbilities = { ...editedAbilities };
    newAbilities[key] = { ...newAbilities[key], score };
    setEditedAbilities(newAbilities);
  };

  const handleSave = () => {
    onSave(editedAbilities);
    onClose();
  };

  useEffect(() => {
    setEditedAbilities(abilities);
  }, [abilities]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-4 border-black bg-white">
        <DialogHeader>
          <DialogTitle className="font-black uppercase">Edit Abilities</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {Object.keys(editedAbilities).map((key) => (
            <div key={key} className="grid grid-cols-2 gap-4 items-center">
              <Label className="font-black">{editedAbilities[key].name}</Label>
              <Input
                type="number"
                value={editedAbilities[key].score}
                onChange={(e) => handleScoreChange(key, parseInt(e.target.value) || 10)}
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
