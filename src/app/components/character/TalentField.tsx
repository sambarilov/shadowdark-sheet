import { Talent } from '../../types';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ui/context-menu';

type TalentProps = {
  talent: Talent;
  onEditTalent: (talent: Talent) => void;
  onRemoveTalent: (id: string) => void;
};


export const TalentField = (props: TalentProps) => {
  const { talent, onEditTalent, onRemoveTalent } = props;

  return (
    <ContextMenu key={talent.id}>
      <ContextMenuTrigger asChild>
        <div className="border-2 border-black p-3 bg-white group cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-lg text-sm mb-2 font-bold">Gained at: {talent.level}</div>
              <p className="text-sm text-gray-600">{talent.description}</p>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onEditTalent(talent)}>
          Edit Talent
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onRemoveTalent(talent.id)} className="text-red-600">
          Delete Talent
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}