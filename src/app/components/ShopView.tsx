import { useState } from 'react';
import { Search, ShoppingCart, ArrowLeft, Coins } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { ItemData } from './InventoryView';

export interface ShopItem {
  id: string;
  name: string;
  category: string;
  price: {
    gold: number;
    silver: number;
    copper: number;
  };
  damage?: string;
  description: string;
}

interface ShopViewProps {
  onClose: () => void;
  onBuyItem: (item: ShopItem) => void;
  onSellItem: (item: ItemData) => void;
  playerCoins: {
    gold: number;
    silver: number;
    copper: number;
  };
  inventoryItems: ItemData[];
}

export function ShopView({ onClose, onBuyItem, onSellItem, playerCoins, inventoryItems }: ShopViewProps) {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [searchQuery, setSearchQuery] = useState('');

  const shopItems: ShopItem[] = [
    // Weapons
    {
      id: 'shop-1',
      name: 'Longsword',
      category: 'Weapons',
      price: { gold: 15, silver: 0, copper: 0 },
      damage: '1d8',
      description: 'A versatile blade'
    },
    {
      id: 'shop-2',
      name: 'Shortsword',
      category: 'Weapons',
      price: { gold: 10, silver: 0, copper: 0 },
      damage: '1d6',
      description: 'Light and quick'
    },
    {
      id: 'shop-3',
      name: 'Dagger',
      category: 'Weapons',
      price: { gold: 2, silver: 0, copper: 0 },
      damage: '1d4',
      description: 'Small and concealable'
    },
    {
      id: 'shop-4',
      name: 'Battleaxe',
      category: 'Weapons',
      price: { gold: 10, silver: 0, copper: 0 },
      damage: '1d10',
      description: 'Heavy chopping weapon'
    },
    {
      id: 'shop-5',
      name: 'Crossbow',
      category: 'Weapons',
      price: { gold: 25, silver: 0, copper: 0 },
      damage: '1d6',
      description: 'Ranged weapon with bolts'
    },
    // Armor
    {
      id: 'shop-6',
      name: 'Leather Armor',
      category: 'Armor',
      price: { gold: 5, silver: 0, copper: 0 },
      description: 'Light protection, AC +2'
    },
    {
      id: 'shop-7',
      name: 'Chainmail',
      category: 'Armor',
      price: { gold: 30, silver: 0, copper: 0 },
      description: 'Medium armor, AC +4'
    },
    {
      id: 'shop-8',
      name: 'Shield',
      category: 'Armor',
      price: { gold: 10, silver: 0, copper: 0 },
      description: 'Wooden shield, AC +1'
    },
    // Consumables
    {
      id: 'shop-9',
      name: 'Healing Potion',
      category: 'Consumables',
      price: { gold: 50, silver: 0, copper: 0 },
      description: 'Restores 2d6 HP'
    },
    {
      id: 'shop-10',
      name: 'Antidote',
      category: 'Consumables',
      price: { gold: 25, silver: 0, copper: 0 },
      description: 'Cures poison'
    },
    // Gear
    {
      id: 'shop-11',
      name: 'Torch',
      category: 'Gear',
      price: { gold: 0, silver: 1, copper: 0 },
      description: 'Provides light for 1 hour'
    },
    {
      id: 'shop-12',
      name: 'Rope (50ft)',
      category: 'Gear',
      price: { gold: 1, silver: 0, copper: 0 },
      description: 'Sturdy hemp rope'
    },
    {
      id: 'shop-13',
      name: 'Backpack',
      category: 'Gear',
      price: { gold: 2, silver: 0, copper: 0 },
      description: 'Carries your belongings'
    },
    {
      id: 'shop-14',
      name: 'Grappling Hook',
      category: 'Gear',
      price: { gold: 1, silver: 0, copper: 0 },
      description: 'For climbing and securing rope'
    }
  ];

  const filteredShopItems = shopItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInventoryItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedItems = filteredShopItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShopItem[]>);

  const formatPrice = (price: { gold: number; silver: number; copper: number }) => {
    const parts = [];
    if (price.gold > 0) parts.push(`${price.gold}g`);
    if (price.silver > 0) parts.push(`${price.silver}s`);
    if (price.copper > 0) parts.push(`${price.copper}c`);
    return parts.join(' ');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="border-2 border-black hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-2xl font-black uppercase">Shop</h2>
        <div className="flex items-center gap-1 text-sm">
          <Coins size={16} />
          <span className="font-black">{playerCoins.gold}g {playerCoins.silver}s {playerCoins.copper}c</span>
        </div>
      </div>

      {/* Buy/Sell Tabs */}
      <div className="flex border-2 border-black mb-4">
        <button
          onClick={() => setMode('buy')}
          className={`flex-1 py-2 text-sm font-black uppercase ${
            mode === 'buy' ? 'bg-black text-white' : 'bg-white'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`flex-1 py-2 text-sm font-black uppercase ${
            mode === 'sell' ? 'bg-black text-white' : 'bg-white'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} />
        <Input
          type="text"
          placeholder={mode === 'buy' ? 'Search items...' : 'Search inventory...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-2 border-black bg-white"
        />
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-auto">
        {mode === 'buy' ? (
          // Buy Mode
          <div className="space-y-4">
            {Object.keys(groupedItems).length === 0 ? (
              <p className="text-gray-500 italic text-center">No items found</p>
            ) : (
              Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-lg font-black uppercase mb-2 border-b-2 border-black pb-1">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="border-2 border-black p-3 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-black">{item.name}</div>
                            {item.damage && (
                              <div className="text-sm text-gray-600">Damage: {item.damage}</div>
                            )}
                            <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                            <div className="text-sm font-black mt-2">
                              {formatPrice(item.price)}
                            </div>
                          </div>
                          <Button
                            onClick={() => onBuyItem(item)}
                            size="sm"
                            className="bg-black text-white hover:bg-gray-800 border-2 border-black"
                          >
                            <ShoppingCart size={16} className="mr-1" />
                            Buy
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Sell Mode
          <div className="space-y-2">
            {filteredInventoryItems.length === 0 ? (
              <p className="text-gray-500 italic text-center">No items to sell</p>
            ) : (
              filteredInventoryItems.map((item) => (
                <div key={item.id} className="border-2 border-black p-3 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-black">{item.name}</div>
                      {item.damage && (
                        <div className="text-sm text-gray-600">Damage: {item.damage}</div>
                      )}
                      {item.description && (
                        <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                      )}
                      {item.equipped && (
                        <div className="text-xs bg-black text-white inline-block px-2 py-1 mt-2">
                          EQUIPPED
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => onSellItem(item)}
                      size="sm"
                      className="bg-black text-white hover:bg-gray-800 border-2 border-black"
                    >
                      <Coins size={16} className="mr-1" />
                      Sell
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}