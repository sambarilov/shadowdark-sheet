import { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { PlayerView } from './components/PlayerView';
import { InventoryView, type ItemData } from './components/InventoryView';
import { CharacterAttributesView, type CharacterAttribute, type Talent, type Ability } from './components/CharacterAttributesView';
import { ShopView, type ShopItem } from './components/ShopView';
import { Upload, Download } from 'lucide-react';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import spellsData from '../../assets/json/spells.json';

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
  const [luckTokenUsed, setLuckTokenUsed] = useState(false);
  const [characterImported, setCharacterImported] = useState(false);
  const [currentXP, setCurrentXP] = useState(0);
  const [totalXP, setTotalXP] = useState(1000);
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
      value: { gold: 15, silver: 0, copper: 0 },
      slots: 1
    },
    {
      id: '2',
      name: 'Dagger',
      type: 'weapon',
      weaponAbility: 'DEX',
      damage: '1d4',
      equipped: false,
      description: 'Small and quick',
      value: { gold: 2, silver: 0, copper: 0 },
      slots: 1
    },
    {
      id: '3',
      name: 'Leather Armor',
      type: 'armor',
      armorAC: 12,
      equipped: true,
      description: 'Light protection',
      value: { gold: 5, silver: 0, copper: 0 },
      slots: 1
    },
    {
      id: '4',
      name: 'Shield',
      type: 'shield',
      shieldACBonus: 1,
      equipped: false,
      description: 'Wooden shield',
      value: { gold: 10, silver: 0, copper: 0 },
      slots: 1
    },
    {
      id: '5',
      name: 'Healing Potion',
      type: 'consumable',
      uses: 1,
      equipped: false,
      description: 'Restores 2d6 HP',
      value: { gold: 50, silver: 0, copper: 0 },
      slots: 1
    },
    {
      id: '6',
      name: 'Torch',
      type: 'gear',
      equipped: false,
      description: 'Provides light for 1 hour',
      value: { gold: 0, silver: 1, copper: 0 },
      slots: 1
    },
    {
      id: '7',
      name: 'Rope (50ft)',
      type: 'gear',
      equipped: false,
      description: 'Sturdy hemp rope',
      value: { gold: 1, silver: 0, copper: 0 },
      slots: 1
    }
  ]);

  const [spells, setSpells] = useState<Spell[]>([
    {
      id: '1',
      name: 'Magic Missile',
      level: 1,
      duration: 'Instant',
      range: 'Far',
      description: '3 darts of magical force, 1d4+1 damage each',
      active: true
    },
    {
      id: '2',
      name: 'Shield',
      level: 1,
      duration: '1 round',
      range: 'Self',
      description: '+5 AC bonus until end of next turn',
      active: true
    },
    {
      id: '3',
      name: 'Fireball',
      level: 3,
      duration: 'Instant',
      range: 'Far',
      description: '6d6 fire damage in 20-foot radius',
      active: true
    }
  ]);

  const [characterAttributes, setCharacterAttributes] = useState<CharacterAttribute[]>([
    { name: 'Name', value: 'Aldric the Wizard' },
    { name: 'Ancestry', value: 'Human' },
    { name: 'Class', value: 'Wizard' },
    { name: 'Level', value: '3' },
    { name: 'Background', value: 'Scholar' },
    { name: 'Alignment', value: 'Lawful Good' }
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
          const newInventory: ItemData[] = json.gear.map((item: any) => ({
            id: item.instanceId || `item-${Math.random()}`,
            name: item.name || 'Unknown Item',
            type: item.type === 'weapon' ? 'weapon' : 'gear',
            equipped: false,
            description: `${item.quantity || 1}x`,
            value: { 
              gold: item.currency === 'gp' ? item.cost : 0,
              silver: item.currency === 'sp' ? item.cost : 0,
              copper: item.currency === 'cp' ? item.cost : 0
            },
            damage: item.type === 'weapon' ? '1d4' : undefined,
            slots: item.slots || 1
          }));
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
        quantity: 1,
        slots: item.slots || 1,
        cost: item.value?.gold || item.value?.silver || item.value?.copper || 0,
        currency: item.value?.gold ? 'gp' : item.value?.silver ? 'sp' : 'cp',
        equipped: item.equipped || false,
        damage: item.damage || undefined,
        weaponAbility: item.weaponAbility || undefined,
        armorAC: item.armorAC || undefined
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
        gearSlotsTotal,
        gearSlotsUsed,
        bonuses,
        gear,
        spellsKnown,
        gold: coins.gold,
        silver: coins.silver,
        copper: coins.copper
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
      equipped: item.equipped
    }));

  // Calculate AC: base 10, overridden by best equipped armor, plus best equipped shield bonus
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
                  <h2 className="lg:hidden text-xl font-black uppercase mb-4 border-b-2 border-black pb-2">
                    Character Info
                  </h2>
                  <CharacterAttributesView
                    attributes={characterAttributes}
                    abilities={abilities}
                    talents={talents}
                    luckTokenUsed={luckTokenUsed}
                    currentXP={currentXP}
                    totalXP={totalXP}
                    onToggleLuckToken={() => setLuckTokenUsed(!luckTokenUsed)}
                    onUpdateXP={(current, total) => {
                      setCurrentXP(current);
                      setTotalXP(total);
                    }}
                    onUpdateAbilities={setAbilities}
                    onAddTalent={handleAddTalent}
                    onRemoveTalent={handleRemoveTalent}
                  />
                </div>

                {/* Player View */}
                <div className="w-full flex-shrink-0 p-4 overflow-y-auto overflow-x-hidden lg:w-1/3 lg:border-r-2 lg:border-black">
                  <h2 className="lg:hidden text-xl font-black uppercase mb-4 border-b-2 border-black pb-2">
                    Character Sheet
                  </h2>
                  <PlayerView
                    hp={hp}
                    maxHp={maxHp}
                    ac={calculatedAC}
                    weapons={weapons}
                    spells={spells}
                    abilities={abilities}
                    onUpdateHP={setHp}
                    onUpdateMaxHP={setMaxHp}
                    onToggleSpell={handleToggleSpell}
                    onAddSpell={handleAddSpell}
                    onRemoveSpell={handleRemoveSpell}
                  />
                </div>

                {/* Inventory View */}
                <div className="w-full flex-shrink-0 p-4 overflow-y-auto overflow-x-hidden lg:w-1/3">
                  <h2 className="lg:hidden text-xl font-black uppercase mb-4 border-b-2 border-black pb-2">
                    Inventory
                  </h2>
                  <InventoryView
                    items={inventory}
                    onToggleEquipped={handleToggleEquipped}
                    onOpenShop={() => setShowShop(true)}
                    onAddItem={handleAddItem}
                    onRemoveItem={handleRemoveItem}
                    strScore={abilities.find(a => a.shortName === 'STR')?.score || 10}
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
        <div className="bg-black text-white text-center text-xs relative z-10">
        </div>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}

export default App;
