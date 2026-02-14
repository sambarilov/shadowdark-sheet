import { Talent } from '../types';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu';

interface TalentCardProps {
  talent: Talent;
  onEdit?: (talent: Talent) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function TalentCard({ talent, onEdit, onDelete, showActions = true }: TalentCardProps) {
  if (showActions && (onEdit || onDelete)) {
    return (
      <ContextMenu>
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
          {onEdit && (
            <ContextMenuItem onClick={() => onEdit(talent)}>
              Edit Talent
            </ContextMenuItem>
          )}
          {onDelete && (
            <ContextMenuItem onClick={() => onDelete(talent.id)} className="text-red-600">
              Delete Talent
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  return (
    <div className="border-2 border-black p-3 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-black mb-1">{talent.name}</div>
          <p className="text-sm text-gray-600">{talent.description}</p>
        </div>
      </div>
    </div>
  );
}

interface TalentListProps {
  talents: Talent[];
  onEdit?: (talent: Talent) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
  showActions?: boolean;
}

export function TalentList({ 
  talents, 
  onEdit, 
  onDelete, 
  emptyMessage = "No talents", 
  showActions = true 
}: TalentListProps) {
  if (talents.length === 0) {
    return <p className="text-gray-500 italic">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2">
      {talents.map((talent) => (
        <TalentCard
          key={talent.id}
          talent={talent}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={showActions}
        />
      ))}
    </div>
  );
}