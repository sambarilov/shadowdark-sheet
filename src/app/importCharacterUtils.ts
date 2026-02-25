import spellsData from '../../assets/json/spells.json';
import { ImportCharacter, Spell, SpellData, ShadowdarklingsGear, ItemType, ItemData } from "./types";

// Weapon stats lookup database
const WEAPON_STATS: Record<string, { damage: string; weaponAbility?: string; attackBonus?: number }> = {
  'Dagger': { damage: '1d4', weaponAbility: 'STR' },
  'Dagger (obsidian)': { damage: '1d4', weaponAbility: 'STR' },
  'Shortsword': { damage: '1d6', weaponAbility: 'STR' },
  'Longsword': { damage: '1d8', weaponAbility: 'STR' },
  'Greatsword': { damage: '1d12', weaponAbility: 'STR' },
  'Mace': { damage: '1d6', weaponAbility: 'STR' },
  'Warhammer': { damage: '1d10', weaponAbility: 'STR' },
  'Spear': { damage: '1d6', weaponAbility: 'STR' },
  'Staff': { damage: '1d6', weaponAbility: 'STR' },
  'Javelin': { damage: '1d6', weaponAbility: 'STR' },
  'Club': { damage: '1d4', weaponAbility: 'STR' },
  'Crossbow': { damage: '1d6', weaponAbility: 'DEX' },
  'Longbow': { damage: '1d8', weaponAbility: 'DEX' },
  'Shortbow': { damage: '1d6', weaponAbility: 'DEX' },
};

// Armor stats lookup database (AC values)
const ARMOR_STATS: Record<string, { armorAC: number }> = {
  'Leather armor': { armorAC: 11 },
  'Studded leather': { armorAC: 12 },
  'Chainmail': { armorAC: 14 },
  'Chain mail': { armorAC: 14 },
  'Plate armor': { armorAC: 16 },
  'Plate mail': { armorAC: 16 },
  'Mithral chainmail': { armorAC: 15 },
  'Mithral chain mail': { armorAC: 15 },
  'Half plate': { armorAC: 15 },
  'Scale mail': { armorAC: 13 },
};

// Shield stats lookup database (AC bonus)
const SHIELD_STATS: Record<string, { shieldACBonus: number }> = {
  'Shield': { shieldACBonus: 2 },
  'Wooden shield': { shieldACBonus: 2 },
  'Mithral shield': { shieldACBonus: 2 },
  'Tower shield': { shieldACBonus: 3 },
};

const ITEMS_PER_TYPE: Record<string, ItemType> = {
  'Arrows': 'consumable',
  'Crossbow bolts': 'consumable',
  'Iron spikes': 'consumable',
  'Rations': 'consumable',
  'Shield': 'shield',
  'Leather armor': 'armor',
  'Oil, flask': 'consumable',
  'Chainmail': 'armor',
  'Plate armor': 'armor',
  'Mithral chainmail': 'armor',
  'Mithral shield': 'shield',
  'Torch': 'consumable'
}

export function importGear(gear: ShadowdarklingsGear[]): ItemData[] {
  const itemType = (item: any): ItemType => {
    if (item.type == 'weapon') return 'weapon';
    
    return ITEMS_PER_TYPE[item.name] || 'gear';
  }

  const newInventory: ItemData[] = gear.map((item: any) => {
    let itemData: any = {
      id: item.instanceId || `item-${Date.now()}`,
      name: item.name || 'Unknown Item',
      type: itemType(item),
      equipped: item.equipped || false,
      description: item.description || '',
      quantity: item.quantity || 1, // Keep temporarily for splitting
      value: { 
        gold: item.currency === 'gp' ? item.cost : 0,
        silver: item.currency === 'sp' ? item.cost : 0,
        copper: item.currency === 'cp' ? item.cost : 0
      },
      slots: item.slots || 1
    };

    if (itemType(item) === 'weapon') {
      itemData = { 
        ...itemData, 
        ...lookupWeaponData(item.name), 
        damageBonus: item.damageBonus || 0 
      };
    } else if (itemType(item) === 'armor') {
      itemData = {
        ...itemData,
        ...lookupArmorData(item.name)
      }
    } else if (itemType(item) === 'shield') {
      itemData = {
        ...itemData,
        ...lookupShieldData(item.name)
      }
    } 

    itemData.totalUnits = item.totalUnits;
    itemData.currentUnits = item.currentUnits || item.totalUnits;

    return itemData;
  });
    
  // Expand items with quantity > 1 into individual items
  const expandedInventory: ItemData[] = [];
  newInventory.forEach((item: any) => {
    const quantity = item.quantity || 1;
    if (quantity > 1) {
      // Create individual items for each quantity, dividing slots and totalUnits
      const slotsPerItem = Math.ceil(item.slots / quantity);
      const totalUnitsPerItem = Math.floor(item.totalUnits / quantity);
      const currentUnitsPerItem = item.currentUnits ? Math.floor(item.currentUnits / quantity) : undefined;
      
      for (let i = 0; i < quantity; i++) {
        const { quantity: _, ...itemWithoutQuantity } = item;
        expandedInventory.push({
          ...itemWithoutQuantity,
          id: `${item.id}-${i}`,
          slots: slotsPerItem,
          totalUnits: totalUnitsPerItem,
          currentUnits: currentUnitsPerItem,
          unitsPerSlot: currentUnitsPerItem,
        });
      }
    } else {
      const { quantity: _, ...itemWithoutQuantity } = item;
      expandedInventory.push(itemWithoutQuantity);
    }
  });
    
  return expandedInventory;
}

function lookupWeaponData(weaponName: string) {
  return WEAPON_STATS[weaponName] || { damage: '1d6', weaponAbility: 'STR', attackBonus: 0 };
}

function lookupArmorData(armorName: string) {
  return ARMOR_STATS[armorName] || { armorAC: 10 };
}

function lookupShieldData(shieldName: string) {
  return SHIELD_STATS[shieldName] || { shieldACBonus: 0 };
}

export function importSpells(payload: ImportCharacter) {
  if (payload.spellsKnown && typeof payload.spellsKnown === 'string' && payload.spellsKnown.trim() !== 'None') {
    const spellNames = payload.spellsKnown.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    const spellsDatabase: SpellData[] = spellsData as SpellData[];
    
    const newSpells: Spell[] = [];
    spellNames.forEach((spellName: string, index: number) => {
      const spellInfo = spellsDatabase.find(
        (s: SpellData) => s.name.toLowerCase() === spellName.toLowerCase()
      );
      
      if (spellInfo) {
        newSpells.push({
          id: `spell-${index}`,
          name: spellInfo.name,
          tier: spellInfo.tier,
          duration: spellInfo.duration,
          range: spellInfo.range,
          description: spellInfo.description,
          active: true
        });
      } else {
        newSpells.push({
          id: `spell-${index}`,
          name: spellName,
          tier: 1,
          duration: '',
          range: '',
          description: 'Details not available',
          active: true
        });
      }
    });
    
    return newSpells;
  }
}