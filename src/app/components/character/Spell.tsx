import { Spell } from '@/app/types';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ui/context-menu';
import { Button } from '../ui/button';
import { Dices } from 'lucide-react';

type SpellFieldProps = {
  spell: Spell;
  onToggleSpell: (id: string) => void;
  onRemoveSpell: (id: string) => void;
  onEditSpell: (spell: Spell) => void;
  onCastSpell: (spell: Spell) => void;
};


export const SpellField = (props: SpellFieldProps) => {
  const { spell, onToggleSpell, onRemoveSpell, onEditSpell, onCastSpell } = props;

  return (
    <ContextMenu key={spell.id}>
      <ContextMenuTrigger asChild>
        <div className="border-2 border-black p-3 bg-white cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onToggleSpell(spell.id)}
                className={`h-8 px-3 border-2 border-black ${spell.active
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
                Tier {spell.tier}
              </span>
            </div>
            <Button
              onClick={() => onCastSpell(spell)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="bg-black text-white hover:bg-gray-800 border-2 border-black"
              size="sm"
              disabled={!spell.active}
            >
              <Dices size={16} className="mr-1" />
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
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => {
          onEditSpell(spell);
        }}>
          Edit Spell
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onRemoveSpell(spell.id)} className="text-red-600">
          Delete Spell
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
