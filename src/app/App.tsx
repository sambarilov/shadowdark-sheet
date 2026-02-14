import { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { PlayerView } from './components/PlayerView';
import { InventoryView, type ItemData } from './components/InventoryView';
import { CharacterAttributesView, type CharacterAttribute, type Talent, type Ability } from './components/CharacterAttributesView';
import { ShopView } from './components/ShopView';
import { DiceRollerDrawer } from './components/DiceRollerDrawer';
import { EditSpellDialog } from './components/EditSpellDialog';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/dialog';
import { Textarea } from './components/ui/textarea';
import { Label } from './components/ui/label';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import spellsData from '../../assets/json/spells.json';
import { ItemType } from './components/EditItemDialog';
import { ImportDialog } from './components/dialogs/ImportDialog';

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

interface SpellData {
  source: string;
  name: string;
  tier: number;
  spellType: string;
  duration: string;
  range: string;
  description: string;
}

interface Spell {
  id: string;
  name: string;
  level: number;
  duration: string;
  range: string;
  description: string;
  active: boolean;
}

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentView, setCurrentView] = useState<'attributes' | 'player' | 'inventory'>('attributes');
  const [showShop, setShowShop] = useState(false);
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [showSpellDialog, setShowSpellDialog] = useState(false);
  const [editingSpell, setEditingSpell] = useState<Spell | undefined>(undefined);
  const [playerRollResult, setPlayerRollResult] = useState<string | null>(null);
  const [diceRollResult, setDiceRollResult] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [exportJsonText, setExportJsonText] = useState('');
  const [luckTokenUsed, setLuckTokenUsed] = useState(false);
  const [characterImported, setCharacterImported] = useState(false);
  const [currentXP, setCurrentXP] = useState(0);
  const [totalXP, setTotalXP] = useState(10);
  const [languages, setLanguages] = useState('');
  const [hp, setHp] = useState(0);
  const [maxHp, setMaxHp] = useState(0);
  const [weaponBonuses, setWeaponBonuses] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [acBonus, setAcBonus] = useState(0);
  const [buyMarkup, setBuyMarkup] = useState(0);
  const [sellMarkup, setSellMarkup] = useState(-50);
  
  const [coins, setCoins] = useState({
    gold: 0,
    silver: 0,
    copper: 0
  });

  const [abilities, setAbilities] = useState<Ability[]>([
    { name: 'Strength', shortName: 'STR', score: 10, bonus: 0 },
    { name: 'Dexterity', shortName: 'DEX', score: 10, bonus: 0 },
    { name: 'Constitution', shortName: 'CON', score: 10, bonus: 0 },
    { name: 'Intelligence', shortName: 'INT', score: 10, bonus: 0 },
    { name: 'Wisdom', shortName: 'WIS', score: 10, bonus: 0 },
    { name: 'Charisma', shortName: 'CHA', score: 10, bonus: 0 }
  ]);

  const [talents, setTalents] = useState<Talent[]>([]);

  const [inventory, setInventory] = useState<ItemData[]>([]);

  const [spells, setSpells] = useState<Spell[]>([]);

  const [shopItems, setShopItems] = useState<ItemData[]>([]);

  const [characterAttributes, setCharacterAttributes] = useState<CharacterAttribute[]>([
    { name: 'Name', value: '' },
    { name: 'Ancestry', value: '' },
    { name: 'Class', value: '' },
    { name: 'Level', value: '1' },
    { name: 'Background', value: '' },
    { name: 'Alignment', value: '' }
  ]);

  const exportCharacter = () => {
    try {
      // Get character name
      const characterName = characterAttributes.find(attr => attr.name === 'Name')?.value || 'Character';
      
      // Build stats object
      const stats: Record<string, number> = {};
      abilities.forEach(ability => {
        stats[ability.shortName] = ability.score;
      });
      
      // Build bonuses array from talents
      const bonuses = talents.map((talent) => {
        // Try to parse the description back to bonus format
        const parts = talent.description.split(' | ');
        const bonus: any = {
          name: talent.name,
          bonusName: talent.name.replace(/\s+/g, '')
        };
        
        parts.forEach(part => {
          if (part.startsWith('Class:') || part.startsWith('Ancestry:')) {
            const [sourceType, sourceName] = part.split(': ');
            bonus.sourceType = sourceType;
            bonus.sourceName = sourceName;
            bonus.sourceCategory = 'Ability';
          } else if (part.startsWith('Bonus to:')) {
            bonus.bonusTo = part.replace('Bonus to: ', '');
          } else if (part.startsWith('Level ')) {
            bonus.gainedAtLevel = parseInt(part.replace('Level ', '')) || 1;
          } else if (part.startsWith('+')) {
            bonus.bonusAmount = parseInt(part.replace('+', '')) || 0;
          }
        });
        
        if (!bonus.gainedAtLevel) bonus.gainedAtLevel = 1;
        if (!bonus.sourceType) bonus.sourceType = 'Other';
        if (!bonus.sourceName) bonus.sourceName = 'Unknown';
        
        return bonus;
      });
      
      // Build gear array from inventory
      const gear = inventory.map(item => ({
        instanceId: item.id,
        name: item.name,
        type: item.type,
        description: item.description || '',
        slots: item.slots || 1,
        cost: item.value?.gold || item.value?.silver || item.value?.copper || 0,
        currency: item.value?.gold ? 'gp' : item.value?.silver ? 'sp' : 'cp',
        equipped: item.equipped || false,
        damage: item.damage || undefined,
        weaponAbility: item.weaponAbility || undefined,
        attackBonus: item.attackBonus || undefined,
        damageBonus: item.damageBonus || undefined,
        armorAC: item.armorAC || undefined,
        shieldACBonus: item.shieldACBonus || undefined,
        totalUnits: item.totalUnits || undefined,
        currentUnits: item.currentUnits || undefined,
        unitsPerSlot: item.unitsPerSlot || undefined
      }));
      
      // Build spellsKnown string
      const spellsKnown = spells.map(s => s.name).join(', ');
      
      // Calculate gear slots
      const strScore = abilities.find(a => a.shortName === 'STR')?.score || 10;
      const gearSlotsTotal = Math.max(strScore, 10);
      const gearSlotsUsed = inventory.reduce((sum, item) => sum + (item.slots || 0), 0);
      
      // Build the export object
      const exportData = {
        name: characterName,
        stats,
        rolledStats: { ...stats },
        ancestry: characterAttributes.find(attr => attr.name === 'Ancestry')?.value || 'Unknown',
        class: characterAttributes.find(attr => attr.name === 'Class')?.value || 'Unknown',
        level: parseInt(characterAttributes.find(attr => attr.name === 'Level')?.value || '1'),
        levels: [], // Empty for now, could be populated if tracking level history
        XP: currentXP,
        totalXP: totalXP,
        ambitionTalentLevel: {
          level: 1,
          talentRolledDesc: '',
          talentRolledName: '',
          Rolled12TalentOrTwoStatPoints: '',
          Rolled12ChosenTalentDesc: '',
          Rolled12ChosenTalentName: '',
          HitPointRoll: 0,
          stoutHitPointRoll: 0
        },
        title: '',
        alignment: characterAttributes.find(attr => attr.name === 'Alignment')?.value || 'Neutral',
        background: characterAttributes.find(attr => attr.name === 'Background')?.value || 'Unknown',
        deity: '',
        maxHitPoints: maxHp,
        armorClass: calculatedAC,
        acBonus,
        gearSlotsTotal,
        gearSlotsUsed,
        bonuses,
        gear,
        spellsKnown,
        languages,
        gold: coins.gold,
        silver: coins.silver,
        copper: coins.copper,
        weaponBonuses,
        notes,
        shop: {
          shopItems,
          buyMarkup,
          sellMarkup
        }
      };
      
      // Create JSON and show export dialog
      const jsonString = JSON.stringify(exportData, null, 2);
      setExportJsonText(jsonString);
      setShowExportDialog(true);
    } catch (error) {
      console.error('Error exporting character:', error);
      toast.error('Error exporting character');
    }
  };

  const handleDownloadExport = () => {
    const characterName = characterAttributes.find(attr => attr.name === 'Name')?.value || 'Character';
    const blob = new Blob([exportJsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${characterName.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Character exported successfully!');
  };

  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportJsonText);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleOpenImportDialog = () => {
    setImportJsonText('');
    setShowImportDialog(true);
  };

  const handleImportFromPaste = (json: any) => {
    if (!json.trim()) {
      toast.error('Please paste JSON content');
      return;
    }
    
    try {
      const parsedJson = JSON.parse(json);
      processImportData(parsedJson);
      setShowImportDialog(false);
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  const processImportData = (json: any) => {
    // Map character attributes
    setCharacterAttributes([
      { name: 'Name', value: json.name || 'Unknown' },
      { name: 'Ancestry', value: json.ancestry || 'Unknown' },
      { name: 'Class', value: json.class || 'Unknown' },
      { name: 'Level', value: json.level?.toString() || '1' },
      { name: 'Background', value: json.background || 'Unknown' },
      { name: 'Alignment', value: json.alignment || 'Neutral' }
    ]);

    // Continue with all the existing mapping logic...
    const statMap: Record<string, string> = {
      'STR': 'Strength',
      'DEX': 'Dexterity',
      'CON': 'Constitution',
      'INT': 'Intelligence',
      'WIS': 'Wisdom',
      'CHA': 'Charisma'
    };

    if (json.stats || json.rolledStats) {
      const stats = json.stats || json.rolledStats;
      const newAbilities = abilities.map((ability: Ability) => {
        const score = stats[ability.shortName] || 10;
        const bonus = Math.floor((score - 10) / 2);
        return { ...ability, score, bonus };
      });
      setAbilities(newAbilities);
    }

    // Map HP
    if (json.maxHitPoints !== undefined) {
      setMaxHp(json.maxHitPoints);
      setHp(json.maxHitPoints);
    }

    // Map XP
    if (json.XP !== undefined) {
      setCurrentXP(json.XP);
    }
    if (json.totalXP !== undefined) {
      setTotalXP(json.totalXP);
    }

    // Map coins
    setCoins({
      gold: json.gold || 0,
      silver: json.silver || 0,
      copper: json.copper || 0
    });

    // Map languages
    if (json.languages) {
      setLanguages(json.languages);
    }

    // Map AC bonus
    if (json.acBonus !== undefined) {
      setAcBonus(json.acBonus);
    }

    // Map weapon bonuses
    if (json.weaponBonuses) {
      setWeaponBonuses(json.weaponBonuses);
    }

    // Map notes
    if (json.notes) {
      setNotes(json.notes);
    }

    // Map shop data
    if (json.shop) {
      if (json.shop.shopItems && Array.isArray(json.shop.shopItems)) {
        setShopItems(json.shop.shopItems);
      }
      if (json.shop.buyMarkup !== undefined) {
        setBuyMarkup(json.shop.buyMarkup);
      }
      if (json.shop.sellMarkup !== undefined) {
        setSellMarkup(json.shop.sellMarkup);
      }
    }

    // Map talents from bonuses
    if (json.bonuses && Array.isArray(json.bonuses)) {
      const newTalents: Talent[] = json.bonuses.map((b: any, index: number) => {
        const name = b.name || b.bonusName || 'Unknown Bonus';
        const descriptionParts = [];
        
        if (b.sourceType && b.sourceName) {
          descriptionParts.push(`${b.sourceType}: ${b.sourceName}`);
        }
        if (b.bonusTo) {
          descriptionParts.push(`Bonus to: ${b.bonusTo}`);
        }
        if (b.bonusAmount) {
          descriptionParts.push(`+${b.bonusAmount}`);
        }
        if (b.gainedAtLevel) {
          descriptionParts.push(`Level ${b.gainedAtLevel}`);
        }
        
        return {
          id: `bonus-${index}`,
          name,
          description: descriptionParts.length > 0 ? descriptionParts.join(' | ') : 'Special ability'
        };
      });
      
      if (newTalents.length > 0) {
        setTalents(newTalents);
      }
    }

    // Map gear to inventory
    if (json.gear) {
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

      const itemType = (item: any): ItemType => {
        if (item.type == 'weapon') return 'weapon';
       
        return ITEMS_PER_TYPE[item.name] || 'gear';
      }

      const newInventory: any[] = json.gear.map((item: any) => {
        const itemData: any = {
          id: item.instanceId || `item-${Math.random()}`,
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

        // Look up weapon stats if this is a weapon
        if (itemType(item) === 'weapon') {
          const weaponStats = WEAPON_STATS[item.name];
          if (weaponStats) {
            itemData.damage = weaponStats.damage;
            itemData.weaponAbility = weaponStats.weaponAbility || 'STR';
            itemData.attackBonus = weaponStats.attackBonus || 0;
          } else {
            // Default values for unknown weapons
            itemData.damage = item.damage || '1d6';
            itemData.weaponAbility = item.weaponAbility || 'STR';
            itemData.attackBonus = item.attackBonus || 0;
          }
          // Always check for damageBonus in the imported data
          itemData.damageBonus = item.damageBonus || undefined;
        } else if (itemType(item) === 'armor') {
          // Look up armor stats
          const armorStats = ARMOR_STATS[item.name];
          if (armorStats) {
            itemData.armorAC = armorStats.armorAC;
          } else {
            itemData.armorAC = item.armorAC || undefined;
          }
        } else if (itemType(item) === 'shield') {
          // Look up shield stats
          const shieldStats = SHIELD_STATS[item.name];
          if (shieldStats) {
            itemData.shieldACBonus = shieldStats.shieldACBonus;
          } else {
            itemData.shieldACBonus = item.shieldACBonus || undefined;
          }
        } else {
          // Non-weapon/armor/shield items can still have these if provided
          itemData.damage = item.damage || undefined;
          itemData.attackBonus = item.attackBonus || undefined;
          itemData.damageBonus = item.damageBonus || undefined;
          itemData.weaponAbility = item.weaponAbility || undefined;
          itemData.armorAC = item.armorAC || undefined;
          itemData.shieldACBonus = item.shieldACBonus || undefined;
        }

        if (item.totalUnits !== undefined) {
          itemData.totalUnits = item.totalUnits;
          itemData.unitsPerSlot = item.unitsPerSlot || item.totalUnits || 1;
          itemData.currentUnits = item.currentUnits !== undefined ? item.currentUnits : item.totalUnits;
        }

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
      
      setInventory(expandedInventory);
    }

    // Map spells
    if (json.spellsKnown && typeof json.spellsKnown === 'string' && json.spellsKnown.trim() !== 'None') {
      const spellNames = json.spellsKnown.split(',').map((s: string) => s.trim()).filter((s: string) => s);
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
            level: spellInfo.tier,
            duration: spellInfo.duration,
            range: spellInfo.range,
            description: spellInfo.description,
            active: true
          });
        } else {
          newSpells.push({
            id: `spell-${index}`,
            name: spellName,
            level: 1,
            duration: '',
            range: '',
            description: 'Details not available',
            active: true
          });
        }
      });
      
      if (newSpells.length > 0) {
        setSpells(newSpells);
      }
    }

    setCharacterImported(true);
    toast.success('Character imported successfully!');
  };

  const importCharacter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        processImportData(json);
      } catch (error) {
        console.error('Error importing character:', error);
        toast.error('Error importing character file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be imported again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  const handleUpdateItem = (item: ItemData) => {
    setInventory((items: ItemData[]) =>
      items.map((i: ItemData) => (i.id === item.id ? item : i))
    );
  };

  const handleRemoveItem = (id: string) => {
    setInventory((items: ItemData[]) => items.filter((item: ItemData) => item.id !== id));
  };

  const handleUpdateCoins = (gold: number, silver: number, copper: number) => {
    setCoins({ gold, silver, copper });
  };

  const handleUseItem = (id: string) => {
    setInventory((items: ItemData[]) => 
      items.map((item: ItemData) => {
        if (item.id === id) {
          // Use unitsPerSlot/currentUnits system
          if (item.unitsPerSlot !== undefined && item.currentUnits !== undefined) {
            let newCurrentUnits = item.currentUnits - 1;
            let newQuantity = Math.ceil(newCurrentUnits / item.unitsPerSlot);
            
            if (newQuantity < 1) {
              toast.success(`${item.name} consumed!`);
              return null;
            }
            
            // Calculate total remaining units across all quantities
            // Full quantities (newQuantity - 1) plus the partial current quantity
            const totalRemaining = (newQuantity - 1) * item.unitsPerSlot + newCurrentUnits;
            toast.success(`Used ${item.name}. ${totalRemaining} unit${totalRemaining !== 1 ? 's' : ''} remaining.`);
            return { ...item, slots: newQuantity, currentUnits: newCurrentUnits };
          }
        }
        return item;
      }).filter((item): item is ItemData => item !== null)
    );
  };

  const handleAddTalent = (talent: Talent) => {
    setTalents((talents: Talent[]) => [...talents, talent]);
  };

  const handleRemoveTalent = (id: string) => {
    setTalents((talents: Talent[]) => talents.filter((talent: Talent) => talent.id !== id));
  };
  const handleToggleSpell = (id: string) => {
    setSpells((spells: Spell[]) =>
      spells.map((spell: Spell) =>
        spell.id === id ? { ...spell, active: !spell.active } : spell
      )
    );
  };

  const handleAddSpell = (spell: Spell) => {
    setSpells((spells: Spell[]) => [...spells, spell]);
  };

  const handleRemoveSpell = (id: string) => {
    setSpells((spells: Spell[]) => spells.filter((spell: Spell) => spell.id !== id));
  };
  const formatPrice = (price: { gold: number; silver: number; copper: number }) => {
    const parts = [];
    if (price.gold > 0) parts.push(`${price.gold}g`);
    if (price.silver > 0) parts.push(`${price.silver}s`);
    if (price.copper > 0) parts.push(`${price.copper}c`);
    return parts.join(' ');
  };

  const handleBuyItem = (shopItem: ItemData) => {
    // Calculate total cost in copper (1 gold = 10 silver, 1 silver = 10 copper)
    const itemCostInCopper = (shopItem.value.gold * 100) + (shopItem.value.silver * 10) + shopItem.value.copper;
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

      // Add item to inventory (create new instance with unique ID)
      const newItem: ItemData = {
        ...shopItem,
        id: `item-${Date.now()}`,
        equipped: false
      };

      setInventory((items: ItemData[]) => [...items, newItem]);
      toast.success(`Purchased ${shopItem.name}!`, {
        description: `Spent ${formatPrice(shopItem.value)}`
      });
    } else {
      toast.error('Not enough coins!', {
        description: 'You need more gold to buy this item.'
      });
    }
  };

  const handleSellItem = (item: ItemData, sellPrice: { gold: number; silver: number; copper: number }) => {
    // Use the provided sell price (already adjusted with markup)
    setCoins((prev: typeof coins) => ({
      gold: prev.gold + sellPrice.gold,
      silver: prev.silver + sellPrice.silver,
      copper: prev.copper + sellPrice.copper
    }));

    // Remove from inventory
    setInventory((items: ItemData[]) => items.filter((i: ItemData) => i.id !== item.id));
    
    toast.success(`Sold ${item.name}!`, {
      description: `Received ${formatPrice(sellPrice)}`
    });
  };

  const handleAddShopItem = (item: ItemData) => {
    setShopItems([...shopItems, item]);
    toast.success(`Added ${item.name} to shop!`);
  };

  const handleUpdateShopItem = (updatedItem: ItemData) => {
    setShopItems(shopItems.map(item => item.id === updatedItem.id ? updatedItem : item));
    toast.success(`Updated ${updatedItem.name}!`);
  };

  const handleRemoveShopItem = (id: string) => {
    setShopItems(shopItems.filter(item => item.id !== id));
    toast.success('Removed item from shop');
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
      weaponAbility: item.weaponAbility || 'STR',
      equipped: item.equipped,
      attackBonus: item.attackBonus || 0,
      damageBonus: item.damageBonus
    }));

  // Calculate AC: base 10, overridden by best equipped armor, plus best equipped shield bonus, plus AC bonus
  const calculateAC = () => {
    let ac = 10; // Base AC
    
    // Find highest AC from equipped armor
    const equippedArmor = inventory.filter(
      (item: ItemData) => item.type === 'armor' && item.equipped && item.armorAC !== undefined
    );
    if (equippedArmor.length > 0) {
      const highestArmorAC = Math.max(...equippedArmor.map((item: ItemData) => item.armorAC || 0));
      ac = highestArmorAC; // Override base AC with armor AC
    }
    
    // Add best equipped shield bonus
    const equippedShields = inventory.filter(
      (item: ItemData) => item.type === 'shield' && item.equipped && item.shieldACBonus !== undefined
    );
    if (equippedShields.length > 0) {
      const highestShieldBonus = Math.max(...equippedShields.map((item: ItemData) => item.shieldACBonus || 0));
      ac += highestShieldBonus;
    }
    
    // Add AC bonus
    ac += acBonus;
    
    return ac;
  };

  const calculatedAC = calculateAC();

  return (
    <div className="min-h-screen bg-white flex items-start justify-center">
      {/* Mobile Container for small screens, full-width for large screens */}
      <div className="w-full max-w-md lg:max-w-none lg:w-full h-[100vh] border-8 border-black bg-white shadow-2xl flex flex-col relative overflow-hidden">
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
                Attributes
              </button>
              <button
                onClick={() => setCurrentView('player')}
                className={`flex-1 py-3 text-sm font-black uppercase ${
                  currentView === 'player' ? 'bg-black text-white' : 'bg-white'
                }`}
              >
                Combat
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
            <div {...handlers} className="flex-1 overflow-hidden relative lg:overflow-visible min-h-0">
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
                <div className="w-full flex-shrink-0 p-4 overflow-y-auto overflow-x-hidden lg:w-1/3 lg:border-r-2 lg:border-black">
                  <CharacterAttributesView
                    attributes={characterAttributes}
                    abilities={abilities}
                    talents={talents}
                    luckTokenUsed={luckTokenUsed}
                    currentXP={currentXP}
                    totalXP={totalXP}
                    languages={languages}
                    characterImported={characterImported}
                    onToggleLuckToken={() => setLuckTokenUsed(!luckTokenUsed)}
                    onUpdateXP={(current, total) => {
                      setCurrentXP(current);
                      setTotalXP(total);
                    }}
                    onUpdateLanguages={setLanguages}
                    onUpdateAttributes={setCharacterAttributes}
                    onUpdateAbilities={setAbilities}
                    onAddTalent={handleAddTalent}
                    onRemoveTalent={handleRemoveTalent}
                    onImportCharacter={handleOpenImportDialog}
                    onExportCharacter={exportCharacter}
                  />
                </div>

                {/* Player View */}
                <div className="w-full flex-shrink-0 p-4 overflow-y-auto overflow-x-hidden lg:w-1/3 lg:border-r-2 lg:border-black">
                  <PlayerView
                    hp={hp}
                    maxHp={maxHp}
                    ac={calculatedAC}
                    acBonus={acBonus}
                    weapons={weapons}
                    spells={spells}
                    abilities={abilities}
                    weaponBonuses={weaponBonuses}
                    notes={notes}
                    onUpdateHP={setHp}
                    onUpdateMaxHP={setMaxHp}
                    onUpdateAcBonus={setAcBonus}
                    onToggleSpell={handleToggleSpell}
                    onAddSpell={handleAddSpell}
                    onRemoveSpell={handleRemoveSpell}
                    onUpdateWeaponBonuses={setWeaponBonuses}
                    onUpdateNotes={setNotes}
                    onOpenSpellDialog={(spell) => {
                      setEditingSpell(spell);
                      setShowSpellDialog(true);
                    }}
                    onShowRollResult={setPlayerRollResult}
                  />
                </div>

                {/* Inventory View */}
                <div className="w-full flex-shrink-0 p-4 overflow-y-auto overflow-x-hidden lg:w-1/3">
                  <InventoryView
                    items={inventory}
                    onToggleEquipped={handleToggleEquipped}
                    onOpenShop={() => setShowShop(true)}
                    onAddItem={handleAddItem}
                    onUpdateItem={handleUpdateItem}
                    onRemoveItem={handleRemoveItem}
                    onUseItem={handleUseItem}
                    strScore={abilities.find(a => a.shortName === 'STR')?.score || 10}
                    coins={coins}
                    onUpdateCoins={handleUpdateCoins}
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
              onAddShopItem={handleAddShopItem}
              onUpdateShopItem={handleUpdateShopItem}
              onRemoveShopItem={handleRemoveShopItem}
              playerCoins={coins}
              inventoryItems={inventory}
              shopItems={shopItems}
              buyMarkup={buyMarkup}
              sellMarkup={sellMarkup}
              onBuyMarkupChange={setBuyMarkup}
              onSellMarkupChange={setSellMarkup}
            />
          </div>
        )}

        {/* Footer */}
        <div className="bg-black text-white text-center text-xs relative z-10">
        </div>

        {/* Floating Dice Roller Button */}
        {!showShop && (
          <button
            onClick={() => setShowDiceRoller(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 border-4 border-black z-50"
            aria-label="Open Dice Roller"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="12" height="12" x="2" y="10" rx="2" ry="2"/>
              <path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/>
              <path d="M6 18h.01"/>
              <path d="M10 14h.01"/>
              <path d="M15 6h.01"/>
              <path d="M18 9h.01"/>
            </svg>
          </button>
        )}

        {/* Dice Roller Drawer */}
        <DiceRollerDrawer 
          open={showDiceRoller} 
          onOpenChange={setShowDiceRoller}
          onShowResult={setDiceRollResult}
        />

        {/* Dice Roll Result Floating Message */}
        {diceRollResult && (
          <div 
            onClick={() => setDiceRollResult(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="border-4 border-black bg-black text-white p-6 text-center animate-in fade-in cursor-pointer shadow-2xl max-w-md pointer-events-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2">
                <rect width="12" height="12" x="2" y="10" rx="2" ry="2"/>
                <path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/>
                <path d="M6 18h.01"/>
                <path d="M10 14h.01"/>
                <path d="M15 6h.01"/>
                <path d="M18 9h.01"/>
              </svg>
              {diceRollResult}
            </div>
          </div>
        )}

        {/* Player Roll Result Popup */}
        {playerRollResult && (
          <div
            onClick={() => setPlayerRollResult(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="border-4 border-black bg-black text-white p-6 text-center animate-in fade-in cursor-pointer shadow-2xl max-w-md pointer-events-auto">
              <svg className="inline-block mr-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="12" height="12" x="2" y="10" rx="2" ry="2"/>
                <path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/>
                <path d="M6 18h.01"/>
                <path d="M10 14h.01"/>
                <path d="M15 6h.01"/>
                <path d="M18 9h.01"/>
              </svg>
              {playerRollResult}
            </div>
          </div>
        )}

        {/* Edit Spell Dialog */}
        {showSpellDialog && (
          <EditSpellDialog
            spell={editingSpell}
            onSave={(spell) => {
              handleAddSpell(spell);
              setShowSpellDialog(false);
              setEditingSpell(undefined);
            }}
            onCancel={() => {
              setShowSpellDialog(false);
              setEditingSpell(undefined);
            }}
          />
        )}
      </div>

      <ImportDialog
        show={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onSubmit={handleImportFromPaste}
      />

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="border-4 border-black max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase">Export Character</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="font-black mb-2 block">Character JSON</Label>
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

      <Toaster richColors position="top-center" />
    </div>
  );
}

export default App;
