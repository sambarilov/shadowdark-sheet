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
  name: string;
  ancestry: string;
  class: string;
  level: number;
  background: string;
  alignment: string;

  abilities: {
    str: Ability;
    dex: Ability;
    con: Ability;
    int: Ability;
    wis: Ability;
    cha: Ability;
  };
  talents: Talent[];
  languages: string;
  currentXP: number;
  xpToNextLevel: number;
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

export interface ShadowdarklingsCharacter {
  name: string;
  ancestry: string;
  class: string;
  level: number;
  title: string;
  alignment: string;
  stats: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  rolledStats: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  levels: ShadowdarklingsLevel[];
  XP: number;
  ambitionTalentLevel: ShadowdarklingsLevel;
  background: string;
  deity: string;
  maxHitPoints: number;
  armorClass: number;
  gearSlotsTotal: number;
  gearSlotsUsed: number;
  bonuses: ShadowdarklingsBonus[];
  goldRolled: number;
  gold: number;
  silver: number;
  copper: number;
  gear: ShadowdarklingsGear[];
  treasures: any[]; // Could be more specific if needed
  magicItems: any[]; // Could be more specific if needed
  attacks: string[];
  ledger: ShadowdarklingsLedgerEntry[];
  spellsKnown: string;
  languages: string;
  creationMethod: string;
  coreRulesOnly: boolean;
  activeSources: string[];
  edits: any[]; // Could be more specific if needed
}

export interface ShadowdarklingsLevel {
  level: number;
  talentRolledDesc: string;
  talentRolledName: string;
  Rolled12TalentOrTwoStatPoints: string;
  Rolled12ChosenTalentDesc: string;
  Rolled12ChosenTalentName: string;
  HitPointRoll: number;
  stoutHitPointRoll: number;
}

export interface ShadowdarklingsBonus {
  sourceType: string;
  sourceName: string;
  sourceCategory: string;
  gainedAtLevel?: number;
  name: string;
  bonusName?: string;
  bonusTo: string;
  bonusAmount?: number;
}

export interface ShadowdarklingsGear {
  instanceId: string;
  gearId: string;
  name: string;
  type: string;
  quantity: number;
  totalUnits: number;
  slots: number;
  cost: number;
  currency: string;
}

export interface ShadowdarklingsLedgerEntry {
  goldChange: number;
  silverChange: number;
  copperChange: number;
  desc: string;
  notes: string;
}


export interface GameActions {
  // Character Actions
  updateCharacterAttribute: (name: string, value: string | number | boolean) => void;
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
  importCharacter: (json: ShadowdarklingsCharacter) => void;
  exportCharacter: () => string;
}