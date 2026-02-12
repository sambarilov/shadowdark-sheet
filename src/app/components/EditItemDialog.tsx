import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export type ItemType = 'weapon' | 'armor' | 'shield' | 'consumable' | 'gear' | 'treasure';

export interface ItemData {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  equipped: boolean;
  value: {
    gold: number;
    silver: number;
    copper: number;
  };
  slots?: number;
  // Weapon specific
  weaponAbility?: string;
  damage?: string;
  attackBonus?: number;
  damageBonus?: string;
  // Armor specific
  armorAC?: number;
  // Shield specific
  shieldACBonus?: number;
  // Consumable specific
  quantity?: number;
  totalUnits?: number;
  currentUnits?: number;
  unitsPerSlot?: number;
}

interface EditItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: ItemData) => void;
  item?: ItemData;
}

export function EditItemDialog({ open, onClose, onSave, item }: EditItemDialogProps) {
  const [name, setName] = useState(item?.name || '');
  const [type, setType] = useState<ItemType>(item?.type || 'gear');
  const [description, setDescription] = useState(item?.description || '');
  const [gold, setGold] = useState(item?.value.gold || 0);
  const [silver, setSilver] = useState(item?.value.silver || 0);
  const [copper, setCopper] = useState(item?.value.copper || 0);
  const [slots, setSlots] = useState(item?.slots || 1);
  
  // Weapon fields
  const [weaponAbility, setWeaponAbility] = useState(item?.weaponAbility || 'STR');
  const [damage, setDamage] = useState(item?.damage || '1d6');
  const [attackBonus, setAttackBonus] = useState(item?.attackBonus || 0);
  const [damageBonus, setDamageBonus] = useState(item?.damageBonus || '');
  
  // Armor fields
  const [armorAC, setArmorAC] = useState(item?.armorAC || 0);
  
  // Shield fields
  const [shieldACBonus, setShieldACBonus] = useState(item?.shieldACBonus || 0);
  
  // Consumable fields
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [totalUnits, setTotalUnits] = useState(item?.totalUnits || 1);
  const [currentUnits, setCurrentUnits] = useState(item?.currentUnits || item?.totalUnits || 1);
  const [unitsPerSlot, setUnitsPerSlot] = useState(item?.unitsPerSlot || 1);

  // Update form fields when item changes
  useEffect(() => {
    if (item) {
      setName(item.name);
      setType(item.type);
      setDescription(item.description);
      setGold(item.value.gold);
      setSilver(item.value.silver);
      setCopper(item.value.copper);
      setSlots(item.slots || 1);
      setWeaponAbility(item.weaponAbility || 'STR');
      setDamage(item.damage || '1d6');
      setAttackBonus(item.attackBonus || 0);
      setDamageBonus(item.damageBonus || '');
      setArmorAC(item.armorAC || 0);
      setShieldACBonus(item.shieldACBonus || 0);
      setQuantity(item.quantity || 1);
      setTotalUnits(item.totalUnits || 1);
      setCurrentUnits(item.currentUnits || item.totalUnits || 1);
      setUnitsPerSlot(item.unitsPerSlot || (item.totalUnits || 1) / (item.slots || 1));
    } else {
      // Reset form for new item
      setName('');
      setType('gear');
      setDescription('');
      setGold(0);
      setSilver(0);
      setCopper(0);
      setSlots(1);
      setWeaponAbility('STR');
      setDamage('1d6');
      setAttackBonus(0);
      setDamageBonus('');
      setArmorAC(0);
      setShieldACBonus(0);
      setQuantity(1);
      setTotalUnits(1);
      setCurrentUnits(1);
      setUnitsPerSlot(1);
    }
  }, [item]);

  const handleSave = () => {
    if (name.trim()) {
      const itemData: ItemData = {
        id: item?.id || `item-${Date.now()}`,
        name: name.trim(),
        type,
        description: description.trim(),
        equipped: item?.equipped || false,
        value: { gold, silver, copper },
        slots,
        quantity,
      };

      if (type === 'weapon') {
        itemData.weaponAbility = weaponAbility;
        itemData.damage = damage;
        itemData.attackBonus = attackBonus;
        itemData.damageBonus = damageBonus.trim() || undefined;
      } else if (type === 'armor') {
        itemData.armorAC = armorAC;
      } else if (type === 'shield') {
        itemData.shieldACBonus = shieldACBonus;
      } else if (type === 'consumable') {
        itemData.totalUnits = totalUnits;
        itemData.currentUnits = currentUnits;
        itemData.unitsPerSlot = unitsPerSlot;
      }

      onSave(itemData);
      onClose();
      
      if (!item) {
        setName('');
        setDescription('');
        setGold(0);
        setSilver(0);
        setCopper(0);
        setSlots(1);
        setWeaponAbility('STR');
        setDamage('1d6');
        setAttackBonus(0);
        setDamageBonus('');
        setArmorAC(0);
        setShieldACBonus(0);
        setQuantity(1);
        setTotalUnits(1);
        setCurrentUnits(1);
        setUnitsPerSlot(1);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-4 border-black bg-white max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-black uppercase">
            {item ? 'Edit Item' : 'Add Item'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="font-black">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-2 border-black mt-1"
              placeholder="Item name"
            />
          </div>
          
          <div>
            <Label className="font-black">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as ItemType)}>
              <SelectTrigger className="border-2 border-black mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weapon">Weapon</SelectItem>
                <SelectItem value="armor">Armor</SelectItem>
                <SelectItem value="shield">Shield</SelectItem>
                <SelectItem value="consumable">Consumable</SelectItem>
                <SelectItem value="gear">Gear</SelectItem>
                <SelectItem value="treasure">Treasure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-black">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-2 border-black mt-1 min-h-20"
              placeholder="Item description"
            />
          </div>
<div>
            <Label className="font-black">Slots</Label>
            <Input
              type="number"
              value={slots}
              onChange={(e) => setSlots(parseInt(e.target.value) || 0)}
              className="border-2 border-black mt-1"
              min={0}
              placeholder="0"
            />
          </div>

          
          {/* Type-specific fields */}
          {type === 'weapon' && (
            <>
              <div>
                <Label className="font-black">Ability Used</Label>
                <Select value={weaponAbility} onValueChange={setWeaponAbility}>
                  <SelectTrigger className="border-2 border-black mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STR">Strength</SelectItem>
                    <SelectItem value="DEX">Dexterity</SelectItem>
                    <SelectItem value="INT">Intelligence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-black">Damage Roll</Label>
                <Input
                  value={damage}
                  onChange={(e) => setDamage(e.target.value)}
                  className="border-2 border-black mt-1"
                  placeholder="e.g., 1d8"
                />
              </div>
              <div>
                <Label className="font-black">Attack Bonus</Label>
                <Input
                  type="number"
                  value={attackBonus}
                  onChange={(e) => setAttackBonus(parseInt(e.target.value) || 0)}
                  className="border-2 border-black mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="font-black">Damage Bonus</Label>
                <Input
                  value={damageBonus}
                  onChange={(e) => setDamageBonus(e.target.value)}
                  className="border-2 border-black mt-1"
                  placeholder="e.g., 2 or 1d4"
                />
              </div>
            </>
          )}

          {type === 'armor' && (
            <div>
              <Label className="font-black">Armor AC Value</Label>
              <Input
                type="number"
                value={armorAC}
                onChange={(e) => setArmorAC(parseInt(e.target.value) || 0)}
                className="border-2 border-black mt-1"
                min={0}
              />
            </div>
          )}

          {type === 'shield' && (
            <div>
              <Label className="font-black">AC Bonus</Label>
              <Input
                type="number"
                value={shieldACBonus}
                onChange={(e) => setShieldACBonus(parseInt(e.target.value) || 0)}
                className="border-2 border-black mt-1"
                min={0}
              />
            </div>
          )}

          {type === 'consumable' && (
            <>
              <div>
                <Label className="font-black">Quantity</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="border-2 border-black mt-1"
                  min={1}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="font-black">Total Units</Label>
                  <Input
                    type="number"
                    value={totalUnits}
                    onChange={(e) => {
                      const newTotal = parseInt(e.target.value) || 1;
                      setTotalUnits(newTotal);
                      if (currentUnits > newTotal) {
                        setCurrentUnits(newTotal);
                      }
                    }}
                    className="border-2 border-black mt-1"
                    min={1}
                  />
                </div>
                <div>
                  <Label className="font-black">Current Units</Label>
                  <Input
                    type="number"
                    value={currentUnits}
                    onChange={(e) => setCurrentUnits(Math.min(parseInt(e.target.value) || 1, totalUnits))}
                    className="border-2 border-black mt-1"
                    min={0}
                    max={totalUnits}
                  />
                </div>
              </div>
            </>
          )}

          {/* Value */}
          <div>
            <Label className="font-black">Value</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div>
                <Label className="text-xs">Gold</Label>
                <Input
                  type="number"
                  value={gold}
                  onChange={(e) => setGold(parseInt(e.target.value) || 0)}
                  className="border-2 border-black"
                  min={0}
                />
              </div>
              <div>
                <Label className="text-xs">Silver</Label>
                <Input
                  type="number"
                  value={silver}
                  onChange={(e) => setSilver(parseInt(e.target.value) || 0)}
                  className="border-2 border-black"
                  min={0}
                />
              </div>
              <div>
                <Label className="text-xs">Copper</Label>
                <Input
                  type="number"
                  value={copper}
                  onChange={(e) => setCopper(parseInt(e.target.value) || 0)}
                  className="border-2 border-black"
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={onClose} variant="outline" className="border-2 border-black">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-black text-white border-2 border-black">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
