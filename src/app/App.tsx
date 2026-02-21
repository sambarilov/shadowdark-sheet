import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { PlayerView } from './components/PlayerView';
import { InventoryView, type ItemData } from './components/InventoryView';
import { CharacterAttributesView } from './components/CharacterAttributesView';
import { ShopView } from './components/ShopView';
import { DiceRollerDrawer } from './components/DiceRollerDrawer';
import { EditSpellDialog } from './components/dialogs/EditSpellDialog';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { ImportDialog } from './components/dialogs/ImportDialog';
import { ExportDialog } from './components/dialogs/ExportDialog';
import { useGame } from './context/GameContext';
import type { Spell } from './types';
import { calculateAC, abilityModifier } from './characterUtils';


function App() {
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
  const [characterImported, setCharacterImported] = useState(false);
  const [weaponBonuses, setWeaponBonuses] = useState<Record<string, number>>({});
  const [buyMarkup, setBuyMarkup] = useState(0);
  const [sellMarkup, setSellMarkup] = useState(-50);
  

  const [shopItems, setShopItems] = useState<ItemData[]>([]);

  const {
    state: {
      name, 
      ancestry, 
      class: characterClass, 
      level, 
      background, 
      alignment,
      currentXP,
      xpToNextLevel,
      languages,
      luckTokenUsed,
      abilities,
      talents,
      traits,
      hitPoints,
      maxHitPoints,
      acBonus,
      notes,
      spells,
      coins,
      inventory
    },
    actions: {
      updateCharacterAttribute,
      updateAbilities,
      importCharacter,
      exportCharacter,
      addTalent,
      removeTalent,
      updateHP,
      updateMaxHP,
      updateAcBonus,
      updateNotes,
      addSpell,
      toggleSpell,
      updateSpell,
      removeSpell,
      updateCoins,
      addItem,
      removeItem,
      updateItem,
      useItem,
      toggleEquipped,
    }
  } = useGame();

  const _exportCharacter = () => {
    try {
      // Get character name
      const characterName = name
      
      // Build stats object
      const stats: Record<string, number> = {};
      Object.keys(abilities).forEach(key => {
        const ability = abilities[key as keyof typeof abilities];
        stats[ability.shortName] = ability.score;
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
      }));
      
      // Build spellsKnown string
      const spellsKnown = spells.map(s => s.name).join(', ');
      
      // Calculate gear slots
      const strScore = abilities.str.score || 10;
      const gearSlotsTotal = Math.max(strScore, 10);
      const gearSlotsUsed = inventory.reduce((sum, item) => sum + (item.slots || 0), 0);
      
      // Build the export object
      const exportData = {
        name: characterName,
        stats,
        rolledStats: { ...stats },
        ancestry: ancestry,
        class: characterClass,
        level: level,
        levels: [], // Empty for now, could be populated if tracking level history
        xp: currentXP,
        xpToNextLevel,
        talents,
        traits,
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
        alignment: alignment,
        background: background,
        deity: '',
        acBonus,
        gearSlotsTotal,
        gearSlotsUsed,
        gear,
        hitPoints,
        maxHitPoints,
        spellsKnown,
        spells,
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
    const characterName = name
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
      processImportData(parsedJson); // TODO: this should go eventually
      importCharacter(parsedJson);
      setShowImportDialog(false);
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  const processImportData = (json: any) => {
    // Continue with all the existing mapping logic...

    // Map weapon bonuses
    if (json.weaponBonuses) {
      setWeaponBonuses(json.weaponBonuses);
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

    setCharacterImported(true);
    toast.success('Character imported successfully!');
  }

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

      updateCoins({
        gold: newGold,
        silver: newSilver,
        copper: newCopper
      });

      // Add item to inventory (create new instance with unique ID)
      const newItem: ItemData = {
        ...shopItem,
        id: `item-${Math.random()}`,
        currentUnits: shopItem.totalUnits,
        equipped: false
      };

      addItem(newItem);
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
    updateCoins({
      gold: coins.gold + sellPrice.gold,
      silver: coins.silver + sellPrice.silver,
      copper: coins.copper + sellPrice.copper
    });

    // Remove from inventory
    removeItem(item.id);
    
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
    .filter(item => item.type === 'weapon')

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
                    attributes={{
                      name,
                      ancestry,
                      class: characterClass,
                      level,
                      background,
                      alignment
                    }}
                    abilities={abilities}
                    talents={talents}
                    luckTokenUsed={luckTokenUsed}
                    currentXP={currentXP}
                    xpToNextLevel={xpToNextLevel}
                    languages={languages}
                    onToggleLuckToken={() => updateCharacterAttribute('luckTokenUsed', !luckTokenUsed)}
                    onUpdateXP={(current, total) => {
                      updateCharacterAttribute('currentXP', current);
                      updateCharacterAttribute('xpToNextLevel', total);
                    }}
                    onUpdateLanguages={(value) => updateCharacterAttribute('languages', value)}
                    onUpdateAttribute={updateCharacterAttribute}
                    onUpdateAbilities={updateAbilities}
                    onAddTalent={addTalent}
                    onRemoveTalent={removeTalent}
                    onImportCharacter={handleOpenImportDialog}
                    onExportCharacter={exportCharacter}
                  />
                </div>

                {/* Player View */}
                <div className="w-full flex-shrink-0 p-4 overflow-y-auto overflow-x-hidden lg:w-1/3 lg:border-r-2 lg:border-black">
                  <PlayerView
                    hp={hitPoints}
                    maxHp={maxHitPoints}
                    ac={calculateAC(inventory, acBonus, abilityModifier(abilities.dex.score))}
                    acBonus={acBonus}
                    weapons={weapons}
                    spells={spells}
                    abilities={abilities}
                    weaponBonuses={weaponBonuses}
                    notes={notes}
                    onUpdateHP={updateHP}
                    onUpdateMaxHP={updateMaxHP}
                    onUpdateAcBonus={updateAcBonus}
                    onToggleSpell={toggleSpell}
                    onRemoveSpell={removeSpell}
                    onUpdateWeaponBonuses={setWeaponBonuses}
                    onUpdateNotes={updateNotes}
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
                    onToggleEquipped={toggleEquipped}
                    onOpenShop={() => setShowShop(true)}
                    onAddItem={addItem}
                    onUpdateItem={(item) => updateItem(item.id, item)}
                    onRemoveItem={removeItem}
                    onUseItem={useItem}
                    strScore={abilities.str.score}
                    coins={coins}
                    onUpdateCoins={updateCoins}
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
              if (spell.id === editingSpell?.id) {
                updateSpell(spell.id, spell);
              } else {
                addSpell(spell);
              }

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

      <ExportDialog
        show={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        text={exportJsonText}
        onDownload={handleDownloadExport}
        onCopy={handleCopyExport}
      />

      <Toaster richColors position="top-center" />
    </div>
  );
}

export default App;
