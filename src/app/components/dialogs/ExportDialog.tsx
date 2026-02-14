import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { useEffect, useState } from 'react';

type ExportDialogProps = {
  show: boolean;
  text: string;
  onCopy: () => void;
  onDownload: () => void;
  onClose: () => void;
};

export const ExportDialog = (props: ExportDialogProps) => {
  const { show, text, onCopy, onDownload, onClose } = props;
  const [exportJsonText, setExportJsonText] = useState('');

  useEffect(() => {
    setExportJsonText(text);
  }, [text]);

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="border-4 border-black max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase">Export Character</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="font-black mb-2 block">Character JSON</Label>
            <Textarea
              value={exportJsonText}
              readOnly
              className="border-2 border-black font-mono text-xs h-64"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-2 border-black"
          >
            Close
          </Button>
          <Button
            onClick={onCopy}
            variant="outline"
            className="border-2 border-black"
          >
            Copy to Clipboard
          </Button>
          <Button
            onClick={onDownload}
            className="bg-black text-white hover:bg-gray-800 border-2 border-black"
          >
            Download File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}