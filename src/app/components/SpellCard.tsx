import { Spell } from '../types';
import { Button } from './ui/button';
import { RollMode } from '../hooks/useDice';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu';

interface SpellCardProps {
  spell: Spell;
  onToggle: (id: string) => void;
  onRoll: (spell: Spell, mode: RollMode) => void;
  onEdit?: (spell: Spell) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function SpellCard({ 
  spell, 
  onToggle, 
  onRoll, 
  onEdit, 
  onDelete, 
  showActions = true 
}: SpellCardProps) {
  const content = (
    <div className="border-2 border-black p-3 bg-white cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onToggle(spell.id)}
            className={`h-8 px-3 border-2 border-black ${
              spell.active
                ? 'bg-white text-black hover:bg-gray-100'
                : 'bg-gray-300 text-gray-600 line-through'
            }`}
            size="sm"
          >
            <span className="font-black text-xs">
              {spell.active ? 'READY' : 'FAILED'}
            </span>
          </Button>
          <span className="font-black">{spell.name}</span>
          <span className="text-xs bg-black text-white px-2 py-1">
            LVL {spell.level}
          </span>
        </div>
        <Button
          onClick={() => onRoll(spell, 'normal')}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="bg-black text-white hover:bg-gray-800 border-2 border-black"
          size="sm"
          disabled={!spell.active}
        >
          Cast
        </Button>
      </div>
      <div className="text-xs text-gray-600 mb-1">
        {spell.range && <span>Range: {spell.range}</span>}
        {spell.range && spell.duration && <span className="mx-2">|</span>}
        {spell.duration && <span>Duration: {spell.duration}</span>}
      </div>
      <p className="text-sm text-gray-600">{spell.description}</p>
    </div>
  );

  if (showActions && (onEdit || onDelete)) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {content}
        </ContextMenuTrigger>
        <ContextMenuContent>
          {onEdit && (
            <ContextMenuItem onClick={() => onEdit(spell)}>
              Edit Spell
            </ContextMenuItem>
          )}
          {onDelete && (
            <ContextMenuItem onClick={() => onDelete(spell.id)} className="text-red-600">
              Delete Spell
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  return content;
}

interface SpellListProps {
  spells: Spell[];
  onToggle: (id: string) => void;
  onRoll: (spell: Spell, mode: RollMode) => void;
  onEdit?: (spell: Spell) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
  showActions?: boolean;
}

export function SpellList({ 
  spells, 
  onToggle, 
  onRoll, 
  onEdit, 
  onDelete, 
  emptyMessage = "No spells available", 
  showActions = true 
}: SpellListProps) {
  if (spells.length === 0) {
    return <p className="text-gray-500 italic">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2">
      {spells.map((spell) => (
        <SpellCard
          key={spell.id}
          spell={spell}
          onToggle={onToggle}
          onRoll={onRoll}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={showActions}
        />
      ))}
    </div>
  );
}