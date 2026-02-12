import { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { PlayerView } from './components/PlayerView';
import { InventoryView, type ItemData } from './components/InventoryView';
import { CharacterAttributesView, type CharacterAttribute, type Talent, type Ability } from './components/CharacterAttributesView';
import { ShopView, type ShopItem } from './components/ShopView';
import { DiceRollerDrawer } from './components/DiceRollerDrawer';
import { Upload, Download } from 'lucide-react';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import spellsData from '../../assets/json/spells.json';
import { ItemType } from './components/EditItemDialog';

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
  const [currentView, setCurrentView] = useState<'attributes' | 'player' | 'inventory'>('player');
  const [showShop, setShowShop] = useState(false);
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [diceRollResult, setDiceRollResult] = useState<string | null>(null);
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

  const [shopItems, setShopItems] = useState<ShopItem[]>([]);

  const [characterAttributes, setCharacterAttributes] = useState<CharacterAttribute[]>([
    { name: 'Name', value: '' },
    { name: 'Ancestry', value: '' },
    { name: 'Class', value: '' },
    { name: 'Level', value: '1' },
    { name: 'Background', value: '' },
    { name: 'Alignment', value: '' }
  ]);

  const importCharacter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        
        // Map character attributes
        setCharacterAttributes([
          { name: 'Name', value: json.name || 'Unknown' },
          { name: 'Ancestry', value: json.ancestry || 'Unknown' },
          { name: 'Class', value: json.class || 'Unknown' },
          { name: 'Level', value: json.level?.toString() || '1' },
          { name: 'Background', value: json.background || 'Unknown' },
          { name: 'Alignment', value: json.alignment || 'Neutral' }
        ]);

        // Map abilities/stats
        const statMap: Record<string, string> = {
          'STR': 'Strength',
          'DEX': 'Dexterity',
          'CON': 'Constitution',
          'INT': 'Intelligence',
          'WIS': 'Wisdom',
          'CHA': 'Charisma'
        };
        
        if (json.stats) {
          const newAbilities: Ability[] = Object.entries(json.stats).map(([key, value]) => {
            const score = value as number;
            const bonus = Math.floor((score - 10) / 2);
            return {
              name: statMap[key] || key,
              shortName: key,
              score,
              bonus
            };
          });
          setAbilities(newAbilities);
        }

        // Map HP
        if (json.maxHitPoints) {
          setMaxHp(json.maxHitPoints);
          setHp(json.maxHitPoints); // Start at max
        }

        // Map XP
        if (json.XP !== undefined) {
          setCurrentXP(json.XP);
        }
        if (json.totalXP !== undefined) {
          setTotalXP(json.totalXP);
        } else {
          // Calculate total XP based on level if not provided
          const level = json.level || 1;
          const xpForLevel = level * 10; // Simple calculation
          setTotalXP(xpForLevel);
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

        // Map shop items
        if (json.shopItems && Array.isArray(json.shopItems)) {
          setShopItems(json.shopItems);
        }

        // Map talents from bonuses
        if (json.bonuses && Array.isArray(json.bonuses)) {
          const newTalents: Talent[] = json.bonuses.map((b: any, index: number) => {
            // Build a descriptive name and description from the bonus data
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
          }

          const itemType = (item: any): ItemType => {
            if (item.type == 'weapon') return 'weapon';
           
            return ITEMS_PER_TYPE[item.name] || 'gear';
          }

          const newInventory: ItemData[] = json.gear.map((item: any) => {
            const itemData: ItemData = {
              id: item.instanceId || `item-${Math.random()}`,
              name: item.name || 'Unknown Item',
              type: itemType(item),
              equipped: item.equipped || false,
              description: item.description || '',
              quantity: item.quantity || 1,
              value: { 
                gold: item.currency === 'gp' ? item.cost : 0,
                silver: item.currency === 'sp' ? item.cost : 0,
                copper: item.currency === 'cp' ? item.cost : 0
              },
              damage: item.damage || undefined,
              attackBonus: item.attackBonus || undefined,
              weaponAbility: item.weaponAbility || undefined,
              armorAC: item.armorAC || undefined,
              shieldACBonus: item.shieldACBonus || undefined,
              slots: item.slots || 1
            };
            
            // If item has totalUnits, import consumable tracking fields
            if (item.totalUnits !== undefined) {
              itemData.totalUnits = item.totalUnits;
              // Use imported currentUnits if present, otherwise default to totalUnits
              itemData.currentUnits = item.currentUnits !== undefined ? item.currentUnits : item.totalUnits;
              // Calculate unitsPerSlot if not present
              if (item.unitsPerSlot === undefined) {
                itemData.unitsPerSlot = item.totalUnits / (item.slots || 1);
              } else {
                itemData.unitsPerSlot = item.unitsPerSlot;
              }
            }
            
            return itemData;
          });
          setInventory(newInventory);
        }

        // Parse spells from spellsKnown field
        if (json.spellsKnown && typeof json.spellsKnown === 'string') {
          const spellNames = json.spellsKnown.split(',').map((name: string) => name.trim());
          const newSpells: Spell[] = [];
          
          spellNames.forEach((spellName: string, index: number) => {
            // Look up spell details from spells.json
            const spellData = (spellsData as SpellData[]).find(
              (s) => s.name.toLowerCase() === spellName.toLowerCase()
            );
            
            if (spellData) {
              newSpells.push({
                id: `spell-${index}`,
                name: spellData.name,
                level: spellData.tier,
                duration: spellData.duration,
                range: spellData.range,
                description: spellData.description,
                active: true
              });
            } else {
              // If spell not found in database, add it with basic info
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
        alert('Character imported successfully!');
      } catch (error) {
        console.error('Error importing character:', error);
        alert('Error importing character file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be imported again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
        quantity: item.quantity || 1,
        slots: item.slots || 1,
        cost: item.value?.gold || item.value?.silver || item.value?.copper || 0,
        currency: item.value?.gold ? 'gp' : item.value?.silver ? 'sp' : 'cp',
        equipped: item.equipped || false,
        damage: item.damage || undefined,
        weaponAbility: item.weaponAbility || undefined,
        attackBonus: item.attackBonus || undefined,
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
        shopItems
      };
      
      // Create and download the JSON file
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${characterName.replace(/\s+/g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Character exported successfully!');
    } catch (error) {
      console.error('Error exporting character:', error);
      toast.error('Error exporting character');
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
          // Use unitsPerSlot/currentUnits/quantity system
          if (item.unitsPerSlot !== undefined && item.currentUnits !== undefined && item.quantity !== undefined) {
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
            return { ...item, slots: newQuantity, currentUnits: newCurrentUnits, quantity: newQuantity };
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
        value: shopItem.price,
        slots: 1
      };

      setInventory((items: ItemData[]) => [...items, newItem]);
      toast.success(`Purchased ${shopItem.name}!`, {
        description: `Spent ${formatPrice(shopItem.price)}`
      });
    } else {
      toast.error('Not enough coins!', {
        description: 'You need more gold to buy this item.'
      });
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
    
    toast.success(`Sold ${item.name}!`, {
      description: `Received ${formatPrice(halfValue)}`
    });
  };

  const handleAddShopItem = (item: ShopItem) => {
    setShopItems([...shopItems, item]);
    toast.success(`Added ${item.name} to shop!`);
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
      attackBonus: item.attackBonus || 0
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
            {/* Import/Export Button */}
            <div className="border-b-2 border-black p-2 bg-white relative z-10">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={importCharacter}
                className="hidden"
              />
              <Button
                onClick={() => characterImported ? exportCharacter() : fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-2"
              >
                {characterImported ? (
                  <>
                    <Download size={16} />
                    Export Character JSON
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Import Character JSON
                  </>
                )}
              </Button>
            </div>

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
                  />
                </div>

                {/* Inventory View */}
                <div className="w-full flex-shrink-0 p-4 overflow-y-auto overflow-x-hidden lg:w-1/3">
                  <InventoryView
                    items={inventory}
                    onToggleEquipped={handleToggleEquipped}
                    onOpenShop={() => setShowShop(true)}
                    onAddItem={handleAddItem}
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
              onRemoveShopItem={handleRemoveShopItem}
              playerCoins={coins}
              inventoryItems={inventory}
              shopItems={shopItems}
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
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 border-4 border-black bg-black text-white p-6 text-center animate-in fade-in cursor-pointer shadow-2xl max-w-md"
          >
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
        )}
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}

export default App;
