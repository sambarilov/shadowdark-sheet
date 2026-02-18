import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Talent } from '../../types';

interface EditTalentDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (talent: Talent) => void;
  talent?: Talent;
}

export function EditTalentDialog({ open, onClose, onSave, talent }: EditTalentDialogProps) {
  const [level, setLevel] = useState(1);
  const [description, setDescription] = useState('');

  // Update form state when talent changes or dialog opens
  useEffect(() => {
    if (open) {
      setLevel(talent?.level || 1);
      setDescription(talent?.description || '');
    }
  }, [open, talent]);

  const handleSave = () => {
    if (level && description.trim()) {
      onSave({
        id: talent?.id || `talent-${Date.now()}`,
        level: level,
        description: description.trim()
      });
      onClose();
      if (!talent) {
        setLevel(1);
        setDescription('');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-4 border-black bg-white">
        <DialogHeader>
          <DialogTitle className="font-black uppercase">
            {talent ? 'Edit Talent' : 'Add Talent'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="font-black">Level</Label>
            <Input
              value={level}
              type='number'
              onChange={(e) => setLevel(Number(e.target.value))}
              className="border-2 border-black mt-1"
              placeholder="Talent level"
            />
          </div>
          <div>
            <Label className="font-black">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-2 border-black mt-1 min-h-24"
              placeholder="Talent description"
            />
          </div>
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
