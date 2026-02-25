import { useState } from 'react';
import { Dices, X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from './ui/drawer';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface DiceInPool {
  id: string;
  sides: number;
}

interface DiceRollerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShowResult: (result: string) => void;
}

export function DiceRollerDrawer({ open, onOpenChange, onShowResult }: DiceRollerDrawerProps) {
  const [dicePool, setDicePool] = useState<DiceInPool[]>([]);
  const [rollMode, setRollMode] = useState<'normal' | 'advantage' | 'disadvantage'>('normal');
  const [bonus, setBonus] = useState(0);

  const diceTypes = [4, 6, 8, 10, 12, 20, 100];

  const addDie = (sides: number) => {
    const newDie: DiceInPool = {
      id: `die-${Date.now()}-${Math.random()}`,
      sides
    };
    setDicePool([...dicePool, newDie]);
  };

  const removeDie = (id: string) => {
    setDicePool(dicePool.filter(die => die.id !== id));
  };

  const clearPool = () => {
    setDicePool([]);
    setRollMode('normal');
    setBonus(0);
  };

  const rollDice = (sides: number) => {
    return Math.floor(Math.random() * sides) + 1;
  };

  const rollPool = () => {
    if (dicePool.length === 0) return;

    let results: { sides: number; result: number; rollDetails?: string }[];
    let modeText = '';

    if (rollMode === 'advantage' || rollMode === 'disadvantage') {
      // Roll each die twice for advantage/disadvantage
      results = dicePool.map(die => {
        const roll1 = rollDice(die.sides);
        const roll2 = rollDice(die.sides);
        const result = rollMode === 'advantage' ? Math.max(roll1, roll2) : Math.min(roll1, roll2);
        return {
          sides: die.sides,
          result,
          rollDetails: `[${roll1}, ${roll2}]`
        };
      });
      modeText = rollMode === 'advantage' ? ' (ADV)' : ' (DIS)';
    } else {
      // Normal roll
      results = dicePool.map(die => ({
        sides: die.sides,
        result: rollDice(die.sides)
      }));
    }

    const diceTotal = results.reduce((sum, r) => sum + r.result, 0);
    const finalTotal = diceTotal + bonus;
    
    const detailsText = results.map(r => {
      const rollInfo = r.rollDetails ? `${r.rollDetails}` : `${r.result}`;
      return `d${r.sides}:${rollInfo}`;
    }).join(' + ');
    
    const bonusText = bonus !== 0 ? ` ${bonus >= 0 ? '+' : ''}${bonus}` : '';
    const totalText = ` = ${finalTotal}`;
    
    // Show result as floating message and close drawer
    onShowResult(`${modeText}${modeText ? ': ' : ''}${detailsText}${bonusText}${totalText}`);
    onOpenChange(false);
    // Clear the pool after rolling
    setDicePool([]);
    setRollMode('normal');
    setBonus(0);
  };

  const groupedDice = dicePool.reduce((acc, die) => {
    acc[die.sides] = (acc[die.sides] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-4 border-black max-h-[90vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="text-2xl font-black uppercase flex items-center gap-2">
            <Dices size={24} />
            Dice Roller
          </DrawerTitle>
        </DrawerHeader>

        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {/* Dice Selection */}
          <div className="px-4 pb-4">
          <h3 className="text-sm font-black uppercase mb-3">Select Dice</h3>
          <div className="grid grid-cols-4 gap-2">
            {diceTypes.map(sides => (
              <Button
                key={sides}
                onClick={() => addDie(sides)}
                variant="outline"
                className="border-2 border-black h-16 flex flex-col items-center justify-center"
              >
                <Dices size={20} />
                <span className="text-xs font-black">d{sides}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Dice Pool */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black uppercase">Dice Pool</h3>
            {dicePool.length > 0 && (
              <Button
                onClick={clearPool}
                variant="outline"
                size="sm"
                className="border-2 border-black"
              >
                Clear
              </Button>
            )}
          </div>
          
          {dicePool.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-500 italic">
              No dice in pool. Click dice above to add them.
            </div>
          ) : (
            <>
              <div className="border-2 border-black p-3 bg-white mb-3">
                <div className="flex flex-wrap gap-2">
                  {dicePool.map(die => (
                    <div
                      key={die.id}
                      className="flex items-center gap-1 bg-black text-white px-2 py-1 text-sm font-black"
                    >
                      <span>d{die.sides}</span>
                      <button
                        onClick={() => removeDie(die.id)}
                        className="hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {Object.entries(groupedDice)
                    .sort(([a], [b]) => Number(b) - Number(a))
                    .map(([sides, count]) => `${count}d${sides}`)
                    .join(' + ')}
                </div>
              </div>

              {/* Roll Mode Selection */}
              <div className="mb-3">
                <h3 className="text-xs font-black uppercase mb-2 text-gray-600">Roll Mode</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => setRollMode('normal')}
                    variant="outline"
                    className={`border-2 border-black text-xs ${
                      rollMode === 'normal' ? 'bg-black text-white' : 'bg-white'
                    }`}
                  >
                    Normal
                  </Button>
                  <Button
                    onClick={() => setRollMode('advantage')}
                    variant="outline"
                    className={`border-2 border-black text-xs ${
                      rollMode === 'advantage' ? 'bg-black text-white' : 'bg-white'
                    }`}
                  >
                    Advantage
                  </Button>
                  <Button
                    onClick={() => setRollMode('disadvantage')}
                    variant="outline"
                    className={`border-2 border-black text-xs ${
                      rollMode === 'disadvantage' ? 'bg-black text-white' : 'bg-white'
                    }`}
                  >
                    Disadvantage
                  </Button>
                </div>
              </div>

              {/* Bonus Field */}
              <div className="mb-3">
                <h3 className="text-xs font-black uppercase mb-2 text-gray-600">Bonus</h3>
                <Input
                  type="number"
                  value={bonus}
                  onChange={(e) => setBonus(parseInt(e.target.value) || 0)}
                  className="border-2 border-black font-black"
                  placeholder="0"
                />
              </div>
            </>
          )}
        </div>
        </div>

        <DrawerFooter className="flex-shrink-0">
          <Button
            onClick={rollPool}
            disabled={dicePool.length === 0}
            className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black"
          >
            <Dices size={16} className="mr-2" />
            Roll Dice Pool
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
