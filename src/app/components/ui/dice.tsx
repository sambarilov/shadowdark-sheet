import { Dices } from 'lucide-react';
import { Button } from './button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './context-menu';
import type { RollMode } from '../../hooks/useDice';

interface DiceButtonProps {
  onRoll: (mode: RollMode) => void;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function DiceButton({ 
  onRoll, 
  disabled = false, 
  size = 'sm', 
  className = '',
  children = 'Roll'
}: DiceButtonProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Button
          onClick={() => onRoll('normal')}
          className={`bg-black text-white hover:bg-gray-800 border-2 border-black ${className}`}
          size={size}
          disabled={disabled}
        >
          <Dices size={16} className="mr-1" />
          {children}
        </Button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onRoll('advantage')}>
          Roll with Advantage
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onRoll('disadvantage')}>
          Roll with Disadvantage
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

interface RollDisplayProps {
  result: string | null;
  onDismiss: () => void;
}

export function RollDisplay({ result, onDismiss }: RollDisplayProps) {
  if (!result) return null;

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
    >
      <div className="border-4 border-black bg-black text-white p-6 text-center animate-in fade-in cursor-pointer shadow-2xl max-w-md pointer-events-auto">
        <Dices className="inline-block mr-2" size={20} />
        {result}
      </div>
    </div>
  );
}