import { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, GameActions, CharacterAttribute, Ability, Talent, Spell, ItemData, Coins } from '../types';

// Initial state
const initialState: GameState = {
  characterAttributes: [
    { name: 'Name', value: '' },
    { name: 'Ancestry', value: '' },
    { name: 'Class', value: '' },
    { name: 'Level', value: '1' },
    { name: 'Background', value: '' },
    { name: 'Alignment', value: '' }
  ],
  abilities: [
    { name: 'Strength', shortName: 'STR', score: 10, bonus: 0 },
    { name: 'Dexterity', shortName: 'DEX', score: 10, bonus: 0 },
    { name: 'Constitution', shortName: 'CON', score: 10, bonus: 0 },
    { name: 'Intelligence', shortName: 'INT', score: 10, bonus: 0 },
    { name: 'Wisdom', shortName: 'WIS', score: 10, bonus: 0 },
    { name: 'Charisma', shortName: 'CHA', score: 10, bonus: 0 }
  ],
  talents: [],
  languages: '',
  currentXP: 0,
  totalXP: 10,
  luckTokenUsed: false,
  hp: 0,
  maxHp: 0,
  acBonus: 0,
  weaponBonuses: {},
  inventory: [],
  coins: { gold: 0, silver: 0, copper: 0 },
  spells: [],
  shopItems: [],
  buyMarkup: 0,
  sellMarkup: -50,
  notes: '',
  characterImported: false
};

// Action types
type GameAction =
  | { type: 'UPDATE_CHARACTER_ATTRIBUTES'; payload: CharacterAttribute[] }
  | { type: 'UPDATE_ABILITIES'; payload: Ability[] }
  | { type: 'UPDATE_LANGUAGES'; payload: string }
  | { type: 'UPDATE_XP'; payload: { current: number; total: number } }
  | { type: 'TOGGLE_LUCK_TOKEN' }
  | { type: 'ADD_TALENT'; payload: Talent }
  | { type: 'REMOVE_TALENT'; payload: string }
  | { type: 'UPDATE_HP'; payload: number }
  | { type: 'UPDATE_MAX_HP'; payload: number }
  | { type: 'UPDATE_AC_BONUS'; payload: number }
  | { type: 'UPDATE_WEAPON_BONUSES'; payload: Record<string, number> }
  | { type: 'ADD_SPELL'; payload: Spell }
  | { type: 'REMOVE_SPELL'; payload: string }
  | { type: 'TOGGLE_SPELL'; payload: string }
  | { type: 'ADD_ITEM'; payload: ItemData }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<ItemData> } }
  | { type: 'UPDATE_COINS'; payload: Coins }
  | { type: 'UPDATE_NOTES'; payload: string }
  | { type: 'IMPORT_CHARACTER' }
  | { type: 'EXPORT_CHARACTER' };

// Reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UPDATE_CHARACTER_ATTRIBUTES':
      return { ...state, characterAttributes: action.payload };
    
    case 'UPDATE_ABILITIES':
      return { ...state, abilities: action.payload };
    
    case 'UPDATE_LANGUAGES':
      return { ...state, languages: action.payload };
    
    case 'UPDATE_XP':
      return { ...state, currentXP: action.payload.current, totalXP: action.payload.total };
    
    case 'TOGGLE_LUCK_TOKEN':
      return { ...state, luckTokenUsed: !state.luckTokenUsed };
    
    case 'ADD_TALENT':
      return { ...state, talents: [...state.talents, action.payload] };
    
    case 'REMOVE_TALENT':
      return { ...state, talents: state.talents.filter(t => t.id !== action.payload) };
    
    case 'UPDATE_HP':
      return { ...state, hp: action.payload };
    
    case 'UPDATE_MAX_HP':
      return { ...state, maxHp: action.payload };
    
    case 'UPDATE_AC_BONUS':
      return { ...state, acBonus: action.payload };
    
    case 'UPDATE_WEAPON_BONUSES':
      return { ...state, weaponBonuses: action.payload };
    
    case 'ADD_SPELL':
      return { ...state, spells: [...state.spells, action.payload] };
    
    case 'REMOVE_SPELL':
      return { ...state, spells: state.spells.filter(s => s.id !== action.payload) };
    
    case 'TOGGLE_SPELL':
      return {
        ...state,
        spells: state.spells.map(s => 
          s.id === action.payload ? { ...s, active: !s.active } : s
        )
      };
    
    case 'ADD_ITEM':
      return { ...state, inventory: [...state.inventory, action.payload] };
    
    case 'REMOVE_ITEM':
      return { ...state, inventory: state.inventory.filter(i => i.id !== action.payload) };
    
    case 'UPDATE_ITEM':
      return {
        ...state,
        inventory: state.inventory.map(i => 
          i.id === action.payload.id ? { ...i, ...action.payload.updates } : i
        )
      };
    
    case 'UPDATE_COINS':
      return { ...state, coins: action.payload };
    
    case 'UPDATE_NOTES':
      return { ...state, notes: action.payload };
    
    case 'IMPORT_CHARACTER':
      return { ...state, characterImported: true };
    
    case 'EXPORT_CHARACTER':
      return state; // This could trigger side effects
    
    default:
      return state;
  }
}

// Context
const GameContext = createContext<{
  state: GameState;
  actions: GameActions;
} | undefined>(undefined);

// Provider component
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const actions: GameActions = {
    updateCharacterAttributes: (attributes) => 
      dispatch({ type: 'UPDATE_CHARACTER_ATTRIBUTES', payload: attributes }),
    
    updateAbilities: (abilities) => 
      dispatch({ type: 'UPDATE_ABILITIES', payload: abilities }),
    
    updateLanguages: (languages) => 
      dispatch({ type: 'UPDATE_LANGUAGES', payload: languages }),
    
    updateXP: (current, total) => 
      dispatch({ type: 'UPDATE_XP', payload: { current, total } }),
    
    toggleLuckToken: () => 
      dispatch({ type: 'TOGGLE_LUCK_TOKEN' }),
    
    addTalent: (talent) => 
      dispatch({ type: 'ADD_TALENT', payload: talent }),
    
    removeTalent: (id) => 
      dispatch({ type: 'REMOVE_TALENT', payload: id }),
    
    updateHP: (hp) => 
      dispatch({ type: 'UPDATE_HP', payload: hp }),
    
    updateMaxHP: (maxHp) => 
      dispatch({ type: 'UPDATE_MAX_HP', payload: maxHp }),
    
    updateAcBonus: (acBonus) => 
      dispatch({ type: 'UPDATE_AC_BONUS', payload: acBonus }),
    
    updateWeaponBonuses: (bonuses) => 
      dispatch({ type: 'UPDATE_WEAPON_BONUSES', payload: bonuses }),
    
    addSpell: (spell) => 
      dispatch({ type: 'ADD_SPELL', payload: spell }),
    
    removeSpell: (id) => 
      dispatch({ type: 'REMOVE_SPELL', payload: id }),
    
    toggleSpell: (id) => 
      dispatch({ type: 'TOGGLE_SPELL', payload: id }),
    
    addItem: (item) => 
      dispatch({ type: 'ADD_ITEM', payload: item }),
    
    removeItem: (id) => 
      dispatch({ type: 'REMOVE_ITEM', payload: id }),
    
    updateItem: (id, updates) => 
      dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } }),
    
    updateCoins: (coins) => 
      dispatch({ type: 'UPDATE_COINS', payload: coins }),
    
    updateNotes: (notes) => 
      dispatch({ type: 'UPDATE_NOTES', payload: notes }),
    
    importCharacter: (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          try {
            const lines = text.split('\n').map(line => 
              line.split(',').map(field => field.replace(/^"|"$/g, '').replace(/""/g, '"'))
            );

            // Find character info section
            const charIndex = lines.findIndex(line => line[0] === 'Character Name');
            if (charIndex >= 0 && charIndex + 1 < lines.length) {
              const charData = lines[charIndex + 1];
              dispatch({
                type: 'UPDATE_CHARACTER_ATTRIBUTES',
                payload: {
                  name: charData[0],
                  level: parseInt(charData[1]) || 1,
                  hitPoints: parseInt(charData[2]) || 0,
                  armorClass: parseInt(charData[3]) || 10
                }
              });
            }
          } catch (error) {
            console.error('Error parsing CSV:', error);
          }
        }
      };
      reader.readAsText(file);
    },
    
    exportCharacter: () => {
      try {
        const csvContent = [
          ['Character Name', 'Level', 'Hit Points', 'Armor Class'],
          [
            state.character.name || 'Unnamed',
            state.character.level?.toString() || '1',
            state.character.hitPoints?.toString() || '0',
            state.character.armorClass?.toString() || '10'
          ],
          ['', '', '', ''],
          ['Abilities'],
          ['Ability', 'Score', 'Bonus'],
          ...state.abilities.map(ability => [ability.name, ability.score.toString(), ability.bonus.toString()]),
          ['', '', ''],
          ['Talents'],
          ['Name', 'Description'],
          ...state.talents.map(talent => [talent.name, talent.description]),
          ['', ''],
          ['Spells'],
          ['Name', 'Description'],
          ...state.spells.map(spell => [spell.name, spell.description]),
          ['', ''],
          ['Inventory'],
          ['Name', 'Category', 'Quantity'],
          ...state.inventory.map(item => [
            item.name,
            item.type || '',
            item.quantity?.toString() || '1'
          ])
        ];

        const csvString = csvContent.map(row => 
          row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `${state.character.name || 'character'}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error('Error exporting character:', error);
      }
    }
  };

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  );
}

// Hook to use the game context
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}