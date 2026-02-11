import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { PlayerView } from './components/PlayerView';
import { InventoryView, type ItemData } from './components/InventoryView';
import { CharacterAttributesView, type CharacterAttribute, type Talent, type Ability } from './components/CharacterAttributesView';
import { ShopView, type ShopItem } from './components/ShopView';

function App() {
  const [currentView, setCurrentView] = useState<'attributes' | 'player' | 'inventory'>('player');
  const [showShop, setShowShop] = useState(false);
  const [luckTokenUsed, setLuckTokenUsed] = useState(false);
  const [hp, setHp] = useState(24);
  const [maxHp, setMaxHp] = useState(32);
  
  const [coins, setCoins] = useState({
    gold: 45,
    silver: 23,
    copper: 18
  });

  const [abilities, setAbilities] = useState<Ability[]>([
    { name: 'Strength', shortName: 'STR', score: 10, bonus: 0 },
    { name: 'Dexterity', shortName: 'DEX', score: 14, bonus: +2 },
    { name: 'Constitution', shortName: 'CON', score: 12, bonus: +1 },
    { name: 'Intelligence', shortName: 'INT', score: 16, bonus: +3 },
    { name: 'Wisdom', shortName: 'WIS', score: 13, bonus: +1 },
    { name: 'Charisma', shortName: 'CHA', score: 8, bonus: -1 }
  ]);

  const [talents, setTalents] = useState<Talent[]>([
    {
      id: '1',
      name: 'Spellcasting',
      description: 'You can cast arcane spells from your spellbook. You know 6 tier 1-2 spells.'
    },
    {
      id: '2',
      name: 'Learning Spells',
      description: 'You can learn new spells by studying scrolls and spellbooks during downtime.'
    },
    {
      id: '3',
      name: 'Educated',
      description: 'You are well-versed in ancient lore and history. Gain advantage on related checks.'
    }
  ]);

  const [inventory, setInventory] = useState<ItemData[]>([
    {
      id: '1',
      name: 'Longsword',
      type: 'weapon',
      weaponAbility: 'STR',
      damage: '1d8',
      equipped: true,
      description: 'A versatile blade',
      value: { gold: 15, silver: 0, copper: 0 }
    },
    {
      id: '2',
      name: 'Dagger',
      type: 'weapon',
      weaponAbility: 'DEX',
      damage: '1d4',
      equipped: false,
      description: 'Small and quick',
      value: { gold: 2, silver: 0, copper: 0 }
    },
    {
      id: '3',
      name: 'Leather Armor',
      type: 'armor',
      armorAC: 12,
      equipped: true,
      description: 'Light protection',
      value: { gold: 5, silver: 0, copper: 0 }
    },
    {
      id: '4',
      name: 'Shield',
      type: 'shield',
      shieldACBonus: 1,
      equipped: false,
      description: 'Wooden shield',
      value: { gold: 10, silver: 0, copper: 0 }
    },
    {
      id: '5',
      name: 'Healing Potion',
      type: 'consumable',
      uses: 1,
      equipped: false,
      description: 'Restores 2d6 HP',
      value: { gold: 50, silver: 0, copper: 0 }
    },
    {
      id: '6',
      name: 'Torch',
      type: 'gear',
      equipped: false,
      description: 'Provides light for 1 hour',
      value: { gold: 0, silver: 1, copper: 0 }
    },
    {
      id: '7',
      name: 'Rope (50ft)',
      type: 'gear',
      equipped: false,
      description: 'Sturdy hemp rope',
      value: { gold: 1, silver: 0, copper: 0 }
    }
  ]);

  const spells = [
    {
      id: '1',
      name: 'Magic Missile',
      level: 1,
      description: '3 darts of magical force, 1d4+1 damage each'
    },
    {
      id: '2',
      name: 'Shield',
      level: 1,
      description: '+5 AC bonus until end of next turn'
    },
    {
      id: '3',
      name: 'Fireball',
      level: 3,
      description: '6d6 fire damage in 20-foot radius'
    }
  ];

  const characterAttributes: CharacterAttribute[] = [
    { name: 'Name', value: 'Aldric the Wizard' },
    { name: 'Ancestry', value: 'Human' },
    { name: 'Class', value: 'Wizard' },
    { name: 'Level', value: '3' },
    { name: 'Background', value: 'Scholar' },
    { name: 'Alignment', value: 'Lawful Good' }
  ];

  const handleToggleEquipped = (id: string) => {
    setInventory((items: ItemData[]) =>
      items.map((item: ItemData) =>
        item.id === id ? { ...item, equipped: !item.equipped } : item
      )
    );
  };

  const handleAddItem = (item: ItemData) => {
    setInventory((items: ItemData[]) => [...items, item]);
  };

  const handleRemoveItem = (id: string) => {
    setInventory((items: ItemData[]) => items.filter((item: ItemData) => item.id !== id));
  };

  const handleAddTalent = (talent: Talent) => {
    setTalents((talents: Talent[]) => [...talents, talent]);
  };

  const handleRemoveTalent = (id: string) => {
    setTalents((talents: Talent[]) => talents.filter((talent: Talent) => talent.id !== id));
  };

  const handleBuyItem = (shopItem: ShopItem) => {
    // Calculate total cost in copper (1 gold = 10 silver, 1 silver = 10 copper)
    const itemCostInCopper = (shopItem.price.gold * 100) + (shopItem.price.silver * 10) + shopItem.price.copper;
    const playerCopperTotal = (coins.gold * 100) + (coins.silver * 10) + coins.copper;

    if (playerCopperTotal >= itemCostInCopper) {
      // Deduct cost
      let remainingCopper = playerCopperTotal - itemCostInCopper;
      const newGold = Math.floor(remainingCopper / 100);
      remainingCopper = remainingCopper % 100;
      const newSilver = Math.floor(remainingCopper / 10);
      const newCopper = remainingCopper % 10;

      setCoins({
        gold: newGold,
        silver: newSilver,
        copper: newCopper
      });

      // Add item to inventory
      const newItem: ItemData = {
        id: `item-${Date.now()}`,
        name: shopItem.name,
        type: shopItem.category === 'Weapons' ? 'weapon' : 
              shopItem.category === 'Armor' ? 'armor' : 'gear',
        damage: shopItem.damage,
        equipped: false,
        description: shopItem.description,
        value: shopItem.price
      };

      setInventory((items: ItemData[]) => [...items, newItem]);
    } else {
      alert('Not enough coins!');
    }
  };

  const handleSellItem = (item: ItemData) => {
    // Calculate 50% sell value
    const halfValue = {
      gold: Math.floor(item.value.gold / 2),
      silver: Math.floor(item.value.silver / 2),
      copper: Math.floor(item.value.copper / 2)
    };
    
    setCoins((prev: typeof coins) => ({
      gold: prev.gold + halfValue.gold,
      silver: prev.silver + halfValue.silver,
      copper: prev.copper + halfValue.copper
    }));

    // Remove from inventory
    setInventory((items: ItemData[]) => items.filter((i: ItemData) => i.id !== item.id));
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!showShop) {
        if (currentView === 'attributes') setCurrentView('player');
        else if (currentView === 'player') setCurrentView('inventory');
      }
    },
    onSwipedRight: () => {
      if (!showShop) {
        if (currentView === 'inventory') setCurrentView('player');
        else if (currentView === 'player') setCurrentView('attributes');
      }
    },
    trackMouse: true
  });

  const weapons = inventory
    .filter((item: ItemData) => item.type === 'weapon' && item.damage)
    .map((item: ItemData) => ({
      id: item.id,
      name: item.name,
      damage: item.damage!,
      equipped: item.equipped
    }));

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Mobile Container for small screens, full-width for large screens */}
      <div className="w-full max-w-md lg:max-w-none lg:w-full h-[90vh] border-8 border-black bg-white shadow-2xl flex flex-col relative overflow-hidden">
        {/* Character Sheet Background Watermark */}
        <div 
          className="absolute inset-0 opacity-5 bg-cover bg-center pointer-events-none"
        />

        {!showShop && (
          <>
            {/* View Indicator - hidden on large screens */}
            <div className="flex border-b-2 border-black relative z-10 lg:hidden">
              <button
                onClick={() => setCurrentView('attributes')}
                className={`flex-1 py-3 text-sm font-black uppercase ${
                  currentView === 'attributes' ? 'bg-black text-white' : 'bg-white'
                }`}
              >
                Info
              </button>
              <button
                onClick={() => setCurrentView('player')}
                className={`flex-1 py-3 text-sm font-black uppercase ${
                  currentView === 'player' ? 'bg-black text-white' : 'bg-white'
                }`}
              >
                Character
              </button>
              <button
                onClick={() => setCurrentView('inventory')}
                className={`flex-1 py-3 text-sm font-black uppercase ${
                  currentView === 'inventory' ? 'bg-black text-white' : 'bg-white'
                }`}
              >
                Inventory
              </button>
            </div>

            {/* Main Content Area - swipeable on mobile, side-by-side on large screens */}
            <div {...handlers} className="flex-1 overflow-hidden relative lg:overflow-visible">
              {/* Mobile: sliding carousel layout, Desktop: side-by-side */}
              <div
                className="flex h-full transition-transform duration-300 ease-out lg:transition-none lg:!transform-none"
                style={{
                  transform: window.innerWidth >= 1024 ? 'translateX(0)' :
                    currentView === 'attributes' ? 'translateX(0)' :
                    currentView === 'player' ? 'translateX(-100%)' :
                    'translateX(-200%)'
                }}
              >
                {/* Character Attributes View */}
                <div className="w-full flex-shrink-0 p-4 overflow-auto lg:w-1/3 lg:border-r-2 lg:border-black">
                  <h2 className="hidden lg:block text-xl font-black uppercase mb-4 border-b-2 border-black pb-2">
                    Character Info
                  </h2>
                  <CharacterAttributesView
                    attributes={characterAttributes}
                    abilities={abilities}
                    talents={talents}
                    luckTokenUsed={luckTokenUsed}
                    onToggleLuckToken={() => setLuckTokenUsed(!luckTokenUsed)}
                    onUpdateAbilities={setAbilities}
                    onAddTalent={handleAddTalent}
                    onRemoveTalent={handleRemoveTalent}
                  />
                </div>

                {/* Player View */}
                <div className="w-full flex-shrink-0 p-4 overflow-auto lg:w-1/3 lg:border-r-2 lg:border-black">
                  <h2 className="hidden lg:block text-xl font-black uppercase mb-4 border-b-2 border-black pb-2">
                    Character Sheet
                  </h2>
                  <PlayerView
                    hp={hp}
                    maxHp={maxHp}
                    ac={14}
                    weapons={weapons}
                    spells={spells}
                    onUpdateHP={setHp}
                    onUpdateMaxHP={setMaxHp}
                  />
                </div>

                {/* Inventory View */}
                <div className="w-full flex-shrink-0 p-4 overflow-auto lg:w-1/3">
                  <h2 className="hidden lg:block text-xl font-black uppercase mb-4 border-b-2 border-black pb-2">
                    Inventory
                  </h2>
                  <InventoryView
                    items={inventory}
                    onToggleEquipped={handleToggleEquipped}
                    onOpenShop={() => setShowShop(true)}
                    onAddItem={handleAddItem}
                    onRemoveItem={handleRemoveItem}
                    coins={coins}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {showShop && (
          <div className="flex-1 overflow-hidden p-4 relative z-10">
            <ShopView
              onClose={() => setShowShop(false)}
              onBuyItem={handleBuyItem}
              onSellItem={handleSellItem}
              playerCoins={coins}
              inventoryItems={inventory}
            />
          </div>
        )}

        {/* Footer */}
        <div className="border-t-4 border-black p-2 bg-black text-white text-center text-xs relative z-10">
          <p>© 2023 The Arcane Library, LLC</p>
        </div>
      </div>
    </div>
  );
}

export default App;
