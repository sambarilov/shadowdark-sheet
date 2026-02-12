import { useState, useRef } from 'react';
import { Search, ShoppingCart, ArrowLeft, Coins, Plus, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu';
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
  onSellItem: (item: ItemData, sellPrice: { gold: number; silver: number; copper: number }) => void;
  onAddShopItem: (item: ShopItem) => void;
  onUpdateShopItem: (item: ShopItem) => void;
  onRemoveShopItem: (id: string) => void;
  playerCoins: {
    gold: number;
    silver: number;
    copper: number;
  };
  inventoryItems: ItemData[];
  shopItems: ShopItem[];
  buyMarkup: number;
  sellMarkup: number;
  onBuyMarkupChange: (value: number) => void;
  onSellMarkupChange: (value: number) => void;
}

export function ShopView({ onClose, onBuyItem, onSellItem, onAddShopItem, onUpdateShopItem, onRemoveShopItem, playerCoins, inventoryItems, shopItems, buyMarkup, sellMarkup, onBuyMarkupChange, onSellMarkupChange }: ShopViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [exportJsonText, setExportJsonText] = useState('');
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Weapons');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemDamage, setNewItemDamage] = useState('');
  const [newItemGold, setNewItemGold] = useState(0);
  const [newItemSilver, setNewItemSilver] = useState(0);
  const [newItemCopper, setNewItemCopper] = useState(0);

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

  const applyMarkup = (price: { gold: number; silver: number; copper: number }, markupPercent: number) => {
    // Convert to copper for calculation
    const totalCopper = (price.gold * 100) + (price.silver * 10) + price.copper;
    const adjustedCopper = Math.floor(totalCopper * (1 + markupPercent / 100));
    
    // Convert back to gold/silver/copper
    const gold = Math.floor(adjustedCopper / 100);
    const silver = Math.floor((adjustedCopper % 100) / 10);
    const copper = adjustedCopper % 10;
    
    return { gold, silver, copper };
  };

  const handleCreateShopItem = () => {
    if (!newItemName.trim()) return;

    if (editingItem) {
      // Edit existing item
      const updatedItem: ShopItem = {
        ...editingItem,
        name: newItemName,
        category: newItemCategory,
        description: newItemDescription,
        damage: newItemDamage || undefined,
        price: {
          gold: newItemGold,
          silver: newItemSilver,
          copper: newItemCopper,
        },
      };
      onUpdateShopItem(updatedItem);
    } else {
      // Add new item
      const newItem: ShopItem = {
        id: `shop-${Date.now()}-${Math.random()}`,
        name: newItemName,
        category: newItemCategory,
        description: newItemDescription,
        damage: newItemDamage || undefined,
        price: {
          gold: newItemGold,
          silver: newItemSilver,
          copper: newItemCopper
        }
      };
      onAddShopItem(newItem);
    }
    
    // Reset form
    setNewItemName('');
    setNewItemCategory('Weapons');
    setNewItemDescription('');
    setNewItemDamage('');
    setNewItemGold(0);
    setNewItemSilver(0);
    setNewItemCopper(0);
    setShowAddDialog(false);
    setEditingItem(null);
  };

  const handleExportStore = () => {
    const storeData = {
      shopItems,
      buyMarkup,
      sellMarkup,
      exportedAt: new Date().toISOString()
    };

    const jsonString = JSON.stringify(storeData, null, 2);
    setExportJsonText(jsonString);
    setShowExportDialog(true);
  };

  const handleDownloadExport = () => {
    const blob = new Blob([exportJsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shop_items_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Store exported successfully!');
  };

  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportJsonText);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const processImportData = (json: any) => {
    if (json.shopItems && Array.isArray(json.shopItems)) {
      // Clear existing shop items and replace with imported ones
      json.shopItems.forEach((item: ShopItem) => {
        // Remove all existing items first (done once)
        if (json.shopItems[0] === item) {
          shopItems.forEach(existingItem => onRemoveShopItem(existingItem.id));
        }
        // Add imported item
        onAddShopItem(item);
      });
      
      // Import markup values
      if (json.buyMarkup !== undefined) {
        onBuyMarkupChange(json.buyMarkup);
      }
      if (json.sellMarkup !== undefined) {
        onSellMarkupChange(json.sellMarkup);
      }
      
      toast.success('Store imported successfully!');
    } else {
      toast.error('Invalid store file format.');
    }
  };

  const handleImportFromPaste = () => {
    if (!importJsonText.trim()) {
      toast.error('Please paste JSON content');
      return;
    }
    
    try {
      const json = JSON.parse(importJsonText);
      processImportData(json);
      setShowImportDialog(false);
      setImportJsonText('');
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  const handleImportStore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        processImportData(json);
      } catch (error) {
        console.error('Error importing store:', error);
        toast.error('Error importing store file.');
      }
    };
    reader.readAsText(file);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        <div className="flex items-center gap-2">
          {mode === 'buy' ? (
            <>
              <div className="flex items-center gap-1">
                <Label className="text-xs font-black whitespace-nowrap">Markup:</Label>
                <Input
                  type="number"
                  value={buyMarkup}
                  onChange={(e) => onBuyMarkupChange(parseInt(e.target.value) || 0)}
                  className="w-16 h-8 text-xs border-2 border-black"
                  placeholder="0"
                />
                <span className="text-xs font-black">%</span>
              </div>
              <Button
                onClick={() => setShowImportDialog(true)}
                size="sm"
                variant="outline"
                className="border-2 border-black"
                title="Import Store"
              >
                <Upload size={16} />
              </Button>
              <Button
                onClick={handleExportStore}
                size="sm"
                variant="outline"
                className="border-2 border-black"
                title="Export Store"
              >
                <Download size={16} />
              </Button>
              <Button
                onClick={() => setShowAddDialog(true)}
                size="sm"
                variant="outline"
                className="border-2 border-black"
                title="Add Item"
              >
                <Plus size={16} />
              </Button>
            </>
          ) : (
            <></>  
          )}
        </div>
      </div>
      <div className="flex justify-between gap-4 mb-4">
        <div className="flex items-center gap-1 text-sm">
          <Coins size={16} />
          <span className="font-black">{playerCoins.gold}g {playerCoins.silver}s {playerCoins.copper}c</span>
        </div>
        {mode === 'buy' ? (
          <div className="flex items-center gap-1">
            <Label className="text-xs font-black whitespace-nowrap">Markup:</Label>
            <Input
              type="number"
              value={buyMarkup}
              onChange={(e) => onBuyMarkupChange(parseInt(e.target.value) || 0)}
              className="w-16 h-8 text-xs border-2 border-black"
              placeholder="0"
            />
            <span className="text-xs font-black">%</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Label className="text-xs font-black whitespace-nowrap">Markup:</Label>
            <Input
              type="number"
              value={sellMarkup}
              onChange={(e) => onSellMarkupChange(parseInt(e.target.value) || 0)}
              className="w-16 h-8 text-xs border-2 border-black"
              placeholder="-50"
            />
            <span className="text-xs font-black">%</span>
          </div>
        )}
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
                      <ContextMenu key={item.id}>
                        <ContextMenuTrigger asChild>
                          <div className="border-2 border-black p-3 bg-white cursor-pointer">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="font-black">{item.name}</div>
                                {item.damage && (
                                  <div className="text-sm text-gray-600">Damage: {item.damage}</div>
                                )}
                                <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                                <div className="text-sm font-black mt-2">
                                  {formatPrice(applyMarkup(item.price, buyMarkup))}
                                </div>
                              </div>
                              <Button
                                onClick={() => onBuyItem({ ...item, price: applyMarkup(item.price, buyMarkup) })}
                                size="sm"
                                className="bg-black text-white hover:bg-gray-800 border-2 border-black"
                              >
                                <ShoppingCart size={16} className="mr-1" />
                                Buy
                              </Button>
                            </div>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => {
                            setEditingItem(item);
                            setNewItemName(item.name);
                            setNewItemCategory(item.category);
                            setNewItemDescription(item.description);
                            setNewItemDamage(item.damage || '');
                            setNewItemGold(item.price.gold);
                            setNewItemSilver(item.price.silver);
                            setNewItemCopper(item.price.copper);
                            setShowAddDialog(true);
                          }}>
                            Edit Item
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => onRemoveShopItem(item.id)} className="text-red-600">
                            Delete Item
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
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
              filteredInventoryItems.map((item) => {
                const sellPrice = applyMarkup(item.value, sellMarkup);
                return (
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
                        <div className="text-sm font-black mt-2">
                          {formatPrice(sellPrice)}
                        </div>
                      </div>
                      <Button
                        onClick={() => onSellItem(item, sellPrice)}
                        size="sm"
                        className="bg-black text-white hover:bg-gray-800 border-2 border-black"
                      >
                        <Coins size={16} className="mr-1" />
                        Sell
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Add Shop Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setEditingItem(null);
          setNewItemName('');
          setNewItemCategory('Weapons');
          setNewItemDescription('');
          setNewItemDamage('');
          setNewItemGold(0);
          setNewItemSilver(0);
          setNewItemCopper(0);
        }
      }}>
        <DialogContent className="border-4 border-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase">{editingItem ? 'Edit Shop Item' : 'Add Shop Item'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="font-black">Name</Label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="border-2 border-black"
                placeholder="Item name"
              />
            </div>

            <div>
              <Label className="font-black">Category</Label>
              <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                <SelectTrigger className="border-2 border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weapons">Weapons</SelectItem>
                  <SelectItem value="Armor">Armor</SelectItem>
                  <SelectItem value="Consumables">Consumables</SelectItem>
                  <SelectItem value="Gear">Gear</SelectItem>
                  <SelectItem value="Treasure">Treasure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-black">Description</Label>
              <Textarea
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                className="border-2 border-black"
                placeholder="Item description"
              />
            </div>

            <div>
              <Label className="font-black">Damage (optional)</Label>
              <Input
                value={newItemDamage}
                onChange={(e) => setNewItemDamage(e.target.value)}
                className="border-2 border-black"
                placeholder="e.g., 1d8"
              />
            </div>

            <div>
              <Label className="font-black">Price</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Gold</Label>
                  <Input
                    type="number"
                    value={newItemGold}
                    onChange={(e) => setNewItemGold(parseInt(e.target.value) || 0)}
                    className="border-2 border-black"
                    min={0}
                  />
                </div>
                <div>
                  <Label className="text-xs">Silver</Label>
                  <Input
                    type="number"
                    value={newItemSilver}
                    onChange={(e) => setNewItemSilver(parseInt(e.target.value) || 0)}
                    className="border-2 border-black"
                    min={0}
                  />
                </div>
                <div>
                  <Label className="text-xs">Copper</Label>
                  <Input
                    type="number"
                    value={newItemCopper}
                    onChange={(e) => setNewItemCopper(parseInt(e.target.value) || 0)}
                    className="border-2 border-black"
                    min={0}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowAddDialog(false)}
              variant="outline"
              className="border-2 border-black"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateShopItem}
              className="bg-black text-white hover:bg-gray-800 border-2 border-black"
            >
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Store Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="border-4 border-black max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase">Import Store</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="font-black mb-2 block">Upload File</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => {
                  handleImportStore(e);
                  setShowImportDialog(false);
                }}
                className="block w-full text-sm border-2 border-black p-2"
              />
            </div>
            <div className="text-center font-black">OR</div>
            <div>
              <Label className="font-black mb-2 block">Paste JSON</Label>
              <Textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder="Paste your store JSON here..."
                className="border-2 border-black font-mono text-xs h-64"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowImportDialog(false)}
              variant="outline"
              className="border-2 border-black"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportFromPaste}
              className="bg-black text-white hover:bg-gray-800 border-2 border-black"
            >
              Import from Paste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Store Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="border-4 border-black max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase">Export Store</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="font-black mb-2 block">Store JSON</Label>
              <Textarea
                value={exportJsonText}
                readOnly
                className="border-2 border-black font-mono text-xs h-64"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowExportDialog(false)}
              variant="outline"
              className="border-2 border-black"
            >
              Close
            </Button>
            <Button
              onClick={handleCopyExport}
              variant="outline"
              className="border-2 border-black"
            >
              Copy to Clipboard
            </Button>
            <Button
              onClick={handleDownloadExport}
              className="bg-black text-white hover:bg-gray-800 border-2 border-black"
            >
              Download File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}