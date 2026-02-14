import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { PlayerView } from './components/PlayerView';
import { CharacterAttributesView } from './components/CharacterAttributesView';
import { InventoryView } from './components/InventoryView';
import { EditSpellDialog } from './components/EditSpellDialog';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import type { Spell } from './types';

function AppContent() {
  const [currentView, setCurrentView] = useState<'attributes' | 'player' | 'inventory'>('attributes');
  const [showSpellDialog, setShowSpellDialog] = useState(false);
  const [editingSpell, setEditingSpell] = useState<Spell | undefined>(undefined);

  const handleOpenSpellDialog = (spell?: Spell) => {
    setEditingSpell(spell);
    setShowSpellDialog(true);
  };

  const handleCloseSpellDialog = () => {
    setShowSpellDialog(false);
    setEditingSpell(undefined);
  };

  const handleSaveSpell = (spell: Spell) => {
    // TODO: Implement spell saving through context
    console.log('Save spell:', spell);
    setShowSpellDialog(false);
    setEditingSpell(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Navigation - Hidden on lg screens */}
      <div className="lg:hidden sticky top-0 bg-white z-20 border-b-4 border-black">
        <div className="flex">
          <Button
            onClick={() => setCurrentView('attributes')}
            className={`flex-1 rounded-none border-0 border-r-2 border-black ${
              currentView === 'attributes'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Character
          </Button>
          <Button
            onClick={() => setCurrentView('player')}
            className={`flex-1 rounded-none border-0 border-r-2 border-black ${
              currentView === 'player'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Player
          </Button>
          <Button
            onClick={() => setCurrentView('inventory')}
            className={`flex-1 rounded-none border-0 ${
              currentView === 'inventory'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Inventory
          </Button>
        </div>
      </div>

      {/* Desktop Layout - Three columns side by side */}
      <div className="hidden lg:flex h-screen">
        {/* Character Attributes Panel */}
        <div className="w-1/3 bg-white border-r-4 border-black overflow-y-auto">
          <div className="p-4">
            <div className="text-center text-xl font-black uppercase mb-4 border-b-2 border-black pb-2">
              Character
            </div>
            <CharacterAttributesView />
          </div>
        </div>

        {/* Player Panel */}
        <div className="w-1/3 bg-white border-r-4 border-black overflow-y-auto">
          <div className="p-4">
            <div className="text-center text-xl font-black uppercase mb-4 border-b-2 border-black pb-2">
              Player
            </div>
            <PlayerView onOpenSpellDialog={handleOpenSpellDialog} />
          </div>
        </div>

        {/* Inventory Panel */}
        <div className="w-1/3 bg-white overflow-y-auto">
          <div className="p-4">
            <div className="text-center text-xl font-black uppercase mb-4 border-b-2 border-black pb-2">
              Inventory
            </div>
            <InventoryView />
          </div>
        </div>
      </div>

      {/* Mobile Content - Shown only on smaller screens */}
      <div className="lg:hidden max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4">
          {currentView === 'attributes' && <CharacterAttributesView />}
          {currentView === 'player' && <PlayerView onOpenSpellDialog={handleOpenSpellDialog} />}
          {currentView === 'inventory' && <InventoryView />}
        </div>
      </div>

      {/* Dialogs */}
      {showSpellDialog && (
        <EditSpellDialog
          spell={editingSpell}
          onSave={handleSaveSpell}
          onCancel={handleCloseSpellDialog}
        />
      )}

      <Toaster />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;