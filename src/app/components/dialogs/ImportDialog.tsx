import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { useState } from 'react';

type ImportDialogProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: (jsonData: string) => void;
};

export const ImportDialog = (props: ImportDialogProps) => {
  const { show, onClose, onSubmit } = props;
  const [jsonText, setJsonText] = useState('');

  const extractJsonFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonText(text);
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* Import Dialog */}
      <Dialog open={show} onOpenChange={onClose}>
        <DialogContent className="border-4 border-black max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase">Import Character</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="font-black mb-2 block">Upload File</Label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    extractJsonFromFile(e.target.files[0]);
                  }
                }}
                className="block w-full text-sm border-2 border-black p-2"
              />
            </div>
            <div className="text-center font-black">OR</div>
            <div>
              <Label className="font-black mb-2 block">Paste JSON</Label>
              <Textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Paste your character JSON here..."
                className="border-2 border-black font-mono text-xs h-64"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => onClose()}
              variant="outline"
              className="border-2 border-black"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onSubmit(jsonText);
                setJsonText('');
              }}
              className="bg-black text-white hover:bg-gray-800 border-2 border-black"
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
