import { useCombat } from '../hooks/useCombat';
import { Ability } from '../types';
import { DiceButton } from './ui/dice';
import { RollMode } from '../hooks/useDice';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu';

interface AbilityScoreProps {
  ability: Ability;
  onRoll?: (ability: Ability, mode: RollMode) => void;
  showRollButton?: boolean;
}

export function AbilityScore({ ability, onRoll, showRollButton = true }: AbilityScoreProps) {
  const { rollAbilityCheck } = useCombat();

  const handleRoll = (mode: RollMode) => {
    if (onRoll) {
      onRoll(ability, mode);
    } else {
      rollAbilityCheck(ability, mode);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={() => handleRoll('normal')}
          className="border-2 border-black p-4 bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors w-full min-h-[96px] flex flex-col items-center justify-center"
        >
          <div className="text-sm font-black uppercase mb-1">{ability.shortName}</div>
          <div className="text-3xl font-black mb-1">{ability.score}</div>
          <div className="text-sm text-gray-600">
            {ability.bonus >= 0 ? '+' : ''}{ability.bonus}
          </div>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => handleRoll('advantage')}>
          Roll with Advantage
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleRoll('disadvantage')}>
          Roll with Disadvantage
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

interface AbilityListProps {
  abilities: Ability[];
  onRoll?: (ability: Ability, mode: RollMode) => void;
  showRollButtons?: boolean;
  columns?: number;
}

export function AbilityList({ abilities, onRoll, showRollButtons = true, columns = 3 }: AbilityListProps) {
  return (
    <div className={`grid grid-cols-${columns} gap-2`}>
      {abilities.map((ability) => (
        <AbilityScore
          key={ability.shortName}
          ability={ability}
          onRoll={onRoll}
          showRollButton={showRollButtons}
        />
      ))}
    </div>
  );
}