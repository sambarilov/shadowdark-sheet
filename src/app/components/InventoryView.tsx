import { Package, ShoppingBag, Coins, Plus } from 'lucide-react';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { EditItemDialog, type ItemData } from './EditItemDialog';
import { EditableStatField } from './EditableStatField';
import { useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu';

interface InventoryViewProps {
  items: ItemData[];
  onToggleEquipped: (id: string) => void;
  onOpenShop: () => void;
  onAddItem: (item: ItemData) => void;
  onRemoveItem: (id: string) => void;
  onUseItem: (id: string) => void;
  strScore: number;
  coins: {
    gold: number;
    silver: number;
    copper: number;
  };
  onUpdateCoins: (gold: number, silver: number, copper: number) => void;
}

export function InventoryView({ items, onToggleEquipped, onOpenShop, onAddItem, onRemoveItem, onUseItem, strScore, coins, onUpdateCoins }: InventoryViewProps) {
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemData | undefined>(undefined);

  const weaponsAndArmor = items.filter(item => 
    item.type === 'weapon' || item.type === 'armor' || item.type === 'shield'
  );
  const otherItems = items.filter(item => 
    item.type === 'consumable' || item.type === 'gear' || item.type === 'treasure'
  );

  const totalSlots = Math.max(strScore, 10);
  const usedSlots = items.reduce((sum, item) => sum + (item.slots || 0), 0);

  const formatItemDetails = (item: ItemData) => {
    const details = [];
    if (item.damage) details.push(`Damage: ${item.damage}`);
    if (item.weaponAbility) details.push(`(${item.weaponAbility})`);
    if (item.armorAC !== undefined) details.push(`AC: ${item.armorAC}`);
    if (item.shieldACBonus !== undefined) details.push(`AC +${item.shieldACBonus}`);
    
    // Show currentUnits/totalUnits across all quantities
    if (item.unitsPerSlot !== undefined && item.currentUnits !== undefined && item.quantity !== undefined && item.unitsPerSlot > 1) {
      const totalCurrentUnits = (item.quantity - 1) * item.unitsPerSlot + item.currentUnits;
      const totalMaxUnits = item.quantity * item.unitsPerSlot;
      details.push(`Units: ${totalCurrentUnits}/${totalMaxUnits}`);
    }
    
    return details.join(' ');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Title and Action Buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Package size={24} />
          <h2 className="text-2xl font-black uppercase">Inventory</h2>
          <span className={`text-sm font-black px-2 py-1 border-2 border-black ${
            usedSlots > totalSlots ? 'bg-red-500 text-white' : 'bg-white'
          }`}>
            {usedSlots}/{totalSlots}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-2 border-black p-2 h-9 w-9"
            onClick={() => setShowItemDialog(true)}
          >
            <Plus size={18} />
          </Button>
          <Button
            size="sm"
            className="bg-black text-white hover:bg-gray-800 border-2 border-black p-2 h-9 w-9"
            onClick={onOpenShop}
          >
            <ShoppingBag size={18} />
          </Button>
        </div>
      </div>

      {/* Coins Section */}
      <div className="mb-4 border-2 border-black p-2 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Coins size={18} />
            <span className="text-sm font-black uppercase">Coins</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs uppercase text-gray-600">Gold</div>
            <EditableStatField
              value={coins.gold}
              onUpdate={(value) => onUpdateCoins(value, coins.silver, coins.copper)}
              className="text-lg font-black"
              min={0}
            />
          </div>
          <div>
            <div className="text-xs uppercase text-gray-600">Silver</div>
            <EditableStatField
              value={coins.silver}
              onUpdate={(value) => onUpdateCoins(coins.gold, value, coins.copper)}
              className="text-lg font-black"
              min={0}
            />
          </div>
          <div>
            <div className="text-xs uppercase text-gray-600">Copper</div>
            <EditableStatField
              value={coins.copper}
              onUpdate={(value) => onUpdateCoins(coins.gold, coins.silver, value)}
              className="text-lg font-black"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Equipment Section */}
      <div className="mb-6">
        <h3 className="text-lg font-black mb-3 uppercase">Equipment</h3>
        <div className="space-y-2">
          {weaponsAndArmor.length === 0 ? (
            <p className="text-gray-500 italic">No equipment</p>
          ) : (
            weaponsAndArmor.map((item) => (
              <ContextMenu key={item.id}>
                <ContextMenuTrigger asChild>
                  <div
                    className={`border-2 border-black p-3 group cursor-pointer ${
                      item.equipped ? 'bg-black text-white' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black">{item.name}</span>
                          {item.slots !== undefined && item.slots > 0 && (
                            <span className="text-xs bg-gray-800 text-white px-2 py-0.5 rounded">
                              {item.slots} slot{item.slots !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
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
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => {
                    setEditingItem(item);
                    setShowItemDialog(true);
                  }}>
                    Edit Item
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onRemoveItem(item.id)} className="text-red-600">
                    Delete Item
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))
          )}
        </div>
      </div>

      {/* Other Items Section */}
      <div className="mb-6">
        <h3 className="text-lg font-black mb-3 uppercase">Items</h3>
        <div className="space-y-2">
          {otherItems.length === 0 ? (
            <p className="text-gray-500 italic">No items</p>
          ) : (
            otherItems.map((item) => (
              <ContextMenu key={item.id}>
                <ContextMenuTrigger asChild>
                  <div className="border-2 border-black p-3 bg-white group cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black">{item.name}</span>
                          {item.slots !== undefined && item.slots > 0 && (
                            <span className="text-xs bg-gray-800 text-white px-2 py-0.5 rounded">
                              {item.slots} slot{item.slots !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {formatItemDetails(item) && (
                          <div className="text-sm text-gray-600">{formatItemDetails(item)}</div>
                        )}
                        {item.description && (
                          <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                        )}
                        <div className="text-sm text-gray-600 mt-1">{item.quantity}x</div>
                      </div>
                      {item.type === 'consumable' && 
                        item.totalUnits !== undefined && 
                        item.currentUnits !== undefined && 
                        item.currentUnits > 0 && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUseItem(item.id);
                          }}
                          size="sm"
                          className="mt-2 bg-black text-white hover:bg-gray-800 border-2 border-black"
                        >
                          Use
                        </Button>
                      )}
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => {
                    setEditingItem(item);
                    setShowItemDialog(true);
                  }}>
                    Edit Item
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onRemoveItem(item.id)} className="text-red-600">
                    Delete Item
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))
          )}
        </div>
      </div>

      <EditItemDialog
        open={showItemDialog}
        item={editingItem}
        onClose={() => {
          setShowItemDialog(false);
          setEditingItem(undefined);
        }}
        onSave={(item) => {
          onAddItem(item);
          setShowItemDialog(false);
          setEditingItem(undefined);
        }}
      />
    </div>
  );
}

// Export ItemData type for use in App.tsx
export type { ItemData };
