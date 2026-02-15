import { Ability } from '../../types';
import { abilityModifier, formatModifier } from '@/app/characterUtils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ui/context-menu';

type AbilityProps = {
  ability: Ability;
  onAbilityRoll: (ability: Ability, rollType?: 'normal' | 'advantage' | 'disadvantage') => void;
};


export const AbilityField = (props: AbilityProps) => {
  const { ability, onAbilityRoll } = props;

  return (
    <ContextMenu key={ability.shortName}>
      <ContextMenuTrigger asChild>
        <button
          onClick={() => onAbilityRoll(ability)}
          className="border-2 border-black p-2 bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors"
      >
        <div className="text-xs font-black uppercase">{ability.shortName}</div>
        <div className="text-2xl font-black">{formatModifier(abilityModifier(ability.score))}</div>
        <div className="text-sm text-gray-600">
          {ability.score}
        </div>
      </button>
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem onClick={() => onAbilityRoll(ability, 'advantage')}>
        Roll with Advantage
      </ContextMenuItem>
      <ContextMenuItem onClick={() => onAbilityRoll(ability, 'disadvantage')}>
        Roll with Disadvantage
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
  );
}