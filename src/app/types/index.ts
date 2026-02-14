// Domain types for the Shadowdark character sheet

export interface Ability {
  name: string;
  shortName: string;
  score: number;
  bonus: number;
}

export interface Talent {
  id: string;
  name: string;
  description: string;
}

export interface CharacterAttribute {
  name: string;
  value: string;
}

export interface Spell {
  id: string;
  name: string;
  level: number;
  duration: string;
  range: string;
  description: string;
  active: boolean;
}

export interface ItemData {
  id: string;
  name: string;
  type: string;
  description?: string;
  slots?: number;
  value?: {
    gold?: number;
    silver?: number;
    copper?: number;
  };
  equipped?: boolean;
  damage?: string;
  weaponAbility?: string;
  attackBonus?: number;
  damageBonus?: string;
  armorAC?: number;
  shieldACBonus?: number;
  totalUnits?: number;
  currentUnits?: number;
  unitsPerSlot?: number;
}

export interface Coins {
  gold: number;
  silver: number;
  copper: number;
}

export interface GameState {
  // Character Info
  characterAttributes: CharacterAttribute[];
  abilities: Ability[];
  talents: Talent[];
  languages: string;
  currentXP: number;
  totalXP: number;
  luckTokenUsed: boolean;
  
  // Combat Stats
  hp: number;
  maxHp: number;
  acBonus: number;
  weaponBonuses: Record<string, number>;
  
  // Items & Inventory
  inventory: ItemData[];
  coins: Coins;
  spells: Spell[];
  shopItems: ItemData[];
  buyMarkup: number;
  sellMarkup: number;
  
  // Session State
  notes: string;
  characterImported: boolean;
}

export interface GameActions {
  // Character Actions
  updateCharacterAttributes: (attributes: CharacterAttribute[]) => void;
  updateAbilities: (abilities: Ability[]) => void;
  updateLanguages: (languages: string) => void;
  updateXP: (current: number, total: number) => void;
  toggleLuckToken: () => void;
  
  // Talent Actions
  addTalent: (talent: Talent) => void;
  removeTalent: (id: string) => void;
  
  // Combat Actions
  updateHP: (hp: number) => void;
  updateMaxHP: (maxHp: number) => void;
  updateAcBonus: (acBonus: number) => void;
  updateWeaponBonuses: (bonuses: Record<string, number>) => void;
  
  // Spell Actions
  addSpell: (spell: Spell) => void;
  removeSpell: (id: string) => void;
  toggleSpell: (id: string) => void;
  
  // Inventory Actions
  addItem: (item: ItemData) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<ItemData>) => void;
  updateCoins: (coins: Coins) => void;
  
  // Session Actions
  updateNotes: (notes: string) => void;
  importCharacter: () => void;
  exportCharacter: () => void;
}