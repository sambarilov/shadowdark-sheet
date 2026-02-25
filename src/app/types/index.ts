// Domain types for the Shadowdark character sheet
export type ItemType = 'weapon' | 'armor' | 'shield' | 'consumable' | 'gear' | 'treasure';

export interface Ability {
  name: string;
  shortName: string;
  score: number;
}

export interface Talent {
  id: string;
  level: number;
  description: string;
}

export interface CharacterAttribute {
  name: string;
  value: string;
}

export interface SpellData {
  name: string;
  tier: number;
  duration: string;
  range: string;
  description: string;
  source: string;
}

export interface Spell extends Omit<SpellData, 'source'> {
  id: string;
  active: boolean;
}

export interface ItemData {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  slots: number;
  value: {
    gold: number;
    silver: number;
    copper: number;
  };
  currentUnits: number;
  totalUnits: number;
  equipped?: boolean;
  damage?: string;
  weaponAbility?: string;
  attackBonus?: number;
  damageBonus?: string;
  armorAC?: number;
  shieldACBonus?: number;
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
  traits: Trait[];
  languages: string;
  currentXP: number;
  xpToNextLevel: number;
  luckTokenUsed: boolean;
  
  // Combat Stats
  hitPoints: number;
  maxHitPoints: number;
  acBonus: number;
  weaponBonuses: Record<string, number>;
  
  // Items & Inventory
  inventory: ItemData[];
  coins: Coins;
  spells: Spell[];
  
  // Session State
  notes: string;
  characterImported: boolean;
  version: string;

  // Shop
  shop: Shop;
}

export interface Shop {
  items: ItemData[];
  buyMarkup: number;
  sellMarkup: number;
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

export interface ImportCharacter extends ShadowdarklingsCharacter {
  luckTokenUsed: boolean;
  currentXP: number;
  xpToNextLevel: number;
  talents: ImportCharacterTalent[];
  traits: Trait[]
  hitPoints: number;
  acBonus: number;
  spells: Spell[];
  inventory: ItemData[];
  shop: Shop;
  notes: string;
  version: string;
}

export interface Trait extends ShadowdarklingsBonus {}

export interface ImportCharacterTalent extends ShadowdarklingsLevel {
  description: string;
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
  updateAbilities: (abilities: Record<string, Ability>) => void;
  updateLanguages: (languages: string) => void;
  updateXP: (current: number, total: number) => void;
  toggleLuckToken: () => void;
  
  // Talent Actions
  addTalent: (talent: Talent) => void;
  updateTalent: (id: string, updates: Partial<Talent>) => void;
  removeTalent: (id: string) => void;
  
  // Combat Actions
  updateHP: (hp: number) => void;
  updateMaxHP: (maxHp: number) => void;
  updateAcBonus: (acBonus: number) => void;
  updateWeaponBonuses: (bonuses: Record<string, number>) => void;
  
  // Spell Actions
  addSpell: (spell: Spell) => void;
  removeSpell: (id: string) => void;
  updateSpell: (id: string, updates: Partial<Spell>) => void;
  toggleSpell: (id: string) => void;
  
  // Inventory Actions
  addItem: (item: ItemData) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<ItemData>) => void;
  toggleEquipped: (id: string) => void;
  updateCoins: (coins: Coins) => void;
  useItem: (id: string) => void;
  
  // Session Actions
  updateNotes: (notes: string) => void;
  importCharacter: (json: ImportCharacter) => void;

  // Shop Actions
  buyItem: (id: string) => void;
  sellItem: (id: string, sellPrice: Coins) => void;
  addShopItem: (item: ItemData) => void;
  removeShopItem: (id: string) => void;
  updateShopItem: (id: string, updates: Partial<ItemData>) => void;
  updateBuyMarkup: (markup: number) => void;
  updateSellMarkup: (markup: number) => void;
}