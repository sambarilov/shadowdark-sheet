import { Package, ShoppingBag, Coins, Plus, Trash2 } from 'lucide-react';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { EditItemDialog, type ItemData } from './EditItemDialog';
import { useState } from 'react';

interface InventoryViewProps {
  items: ItemData[];
  onToggleEquipped: (id: string) => void;
  onOpenShop: () => void;
  onAddItem: (item: ItemData) => void;
  onRemoveItem: (id: string) => void;
  coins: {
    gold: number;
    silver: number;
    copper: number;
  };
}

export function InventoryView({ items, onToggleEquipped, onOpenShop, onAddItem, onRemoveItem, coins }: InventoryViewProps) {
  const [showItemDialog, setShowItemDialog] = useState(false);

  const weaponsAndArmor = items.filter(item => 
    item.type === 'weapon' || item.type === 'armor' || item.type === 'shield'
  );
  const otherItems = items.filter(item => 
    item.type === 'consumable' || item.type === 'gear' || item.type === 'treasure'
  );

  const formatItemDetails = (item: ItemData) => {
    const details = [];
    if (item.damage) details.push(`Damage: ${item.damage}`);
    if (item.weaponAbility) details.push(`(${item.weaponAbility})`);
    if (item.armorAC !== undefined) details.push(`AC: ${item.armorAC}`);
    if (item.shieldACBonus !== undefined) details.push(`AC +${item.shieldACBonus}`);
    if (item.uses !== undefined) details.push(`Uses: ${item.uses}`);
    return details.join(' ');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Package size={24} />
        <h2 className="text-2xl font-black uppercase">Inventory</h2>
      </div>

      {/* Coins Section */}
      <div className="mb-4 border-4 border-black p-3 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <Coins size={20} />
          <h3 className="text-lg font-black uppercase">Coins</h3>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs uppercase text-gray-600">Gold</div>
            <div className="text-xl font-black">{coins.gold}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-gray-600">Silver</div>
            <div className="text-xl font-black">{coins.silver}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-gray-600">Copper</div>
            <div className="text-xl font-black">{coins.copper}</div>
          </div>
        </div>
      </div>

      {/* Shop Button */}
      <Button
        className="w-full mb-4 bg-black text-white hover:bg-gray-800 border-2 border-black h-12"
        onClick={onOpenShop}
      >
        <ShoppingBag size={20} className="mr-2" />
        <span className="font-black uppercase">Visit Shop</span>
      </Button>

      {/* Add Item Button */}
      <Button
        className="w-full mb-4 bg-white text-black hover:bg-gray-100 border-2 border-black h-12"
        onClick={() => setShowItemDialog(true)}
      >
        <Plus size={20} className="mr-2" />
        <span className="font-black uppercase">Add Item</span>
      </Button>

      {/* Equipment Section */}
      <div className="mb-6">
        <h3 className="text-lg font-black mb-3 uppercase">Equipment</h3>
        <div className="space-y-2">
          {weaponsAndArmor.length === 0 ? (
            <p className="text-gray-500 italic">No equipment</p>
          ) : (
            weaponsAndArmor.map((item) => (
              <div
                key={item.id}
                className={`border-2 border-black p-3 group ${
                  item.equipped ? 'bg-black text-white' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-black">{item.name}</div>
                    <div className={`text-sm ${item.equipped ? 'text-gray-300' : 'text-gray-600'}`}>
                      {formatItemDetails(item)}
                    </div>
                    {item.description && (
                      <div className={`text-sm ${item.equipped ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Button
                      onClick={() => onRemoveItem(item.id)}
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-black">
                        {item.equipped ? 'Equipped' : 'Equip'}
                      </span>
                      <Switch
                        checked={item.equipped}
                        onCheckedChange={() => onToggleEquipped(item.id)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Other Items Section */}
      <div className="flex-1 overflow-auto">
        <h3 className="text-lg font-black mb-3 uppercase">Items</h3>
        <div className="space-y-2">
          {otherItems.length === 0 ? (
            <p className="text-gray-500 italic">No items</p>
          ) : (
            otherItems.map((item) => (
              <div key={item.id} className="border-2 border-black p-3 bg-white group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-black">{item.name}</div>
                    {formatItemDetails(item) && (
                      <div className="text-sm text-gray-600">{formatItemDetails(item)}</div>
                    )}
                    {item.description && (
                      <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                    )}
                  </div>
                  <Button
                    onClick={() => onRemoveItem(item.id)}
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <EditItemDialog
        open={showItemDialog}
        onClose={() => setShowItemDialog(false)}
        onSave={onAddItem}
      />
    </div>
  );
}

// Export ItemData type for use in App.tsx
export type { ItemData };
