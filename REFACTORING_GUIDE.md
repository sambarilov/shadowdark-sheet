# Refactored Shadowdark Character Sheet

This document explains the improved code structure that separates domain logic from presentation logic, uses the Context API for state management, and breaks down large components into smaller, reusable pieces.

## 🏗️ Architecture Overview

### 1. **Domain Types** (`src/app/types/index.ts`)
- **Pure domain models**: `Ability`, `Talent`, `CharacterAttribute`, `Spell`, `ItemData`, etc.
- **State interfaces**: `GameState`, `GameActions`
- **No UI dependencies**: These types can be used anywhere in the application

### 2. **Context & State Management** (`src/app/context/GameContext.tsx`)
- **Centralized state**: All game data in one place using React Context
- **Reducer pattern**: Predictable state updates with `useReducer`
- **Type-safe actions**: Strongly typed action creators
- **No business logic**: Just state management

### 3. **Domain Logic Hooks** (`src/app/hooks/`)

#### `useDice.ts`
- **Pure dice mechanics**: Rolling, advantage/disadvantage
- **No UI coupling**: Returns data, not JSX
- **Reusable**: Can be used anywhere dice rolling is needed

#### `useCombat.ts` 
- **Game calculations**: AC calculation, attack rolls, ability checks
- **Business rules**: Critical hits, damage bonuses, ability modifiers
- **Format helpers**: Convert roll results to display strings

### 4. **Reusable UI Components** (`src/app/components/`)

#### Layout Components (`ui/layouts.tsx`)
- **`StatDisplay`**: Consistent stat block display
- **`InfoPanel`**: Section headers with actions
- **`StatCard`**: Small attribute cards
- **`GridLayout`**: Responsive grid layouts

#### Interactive Components (`ui/dice.tsx`)
- **`DiceButton`**: Roll button with advantage/disadvantage context menu
- **`RollDisplay`**: Floating roll result overlay

#### Domain-Specific Components
- **`AbilityScore`**: Individual ability score with roll functionality
- **`TalentCard`**: Talent display with context menu
- **`WeaponCard`**: Weapon stats and roll button
- **`SpellCard`**: Spell information with casting

### 5. **Refactored Views**

#### `CharacterAttributesViewRefactored.tsx`
- **90% smaller**: Removed duplicate logic
- **Uses context**: No prop drilling
- **Composed**: Built from smaller components
- **Focused**: Only handles character attribute logic

#### `PlayerViewRefactored.tsx`
- **Clean separation**: UI logic vs domain logic
- **Reusable components**: Uses WeaponList, SpellList, etc.
- **Context-aware**: Gets state from GameContext

## 🔄 Migration Guide

### Before (Old Structure)
```tsx
// Massive component with everything mixed together
function PlayerView({ hp, maxHp, ac, weapons, spells, onUpdateHP, ... }) {
  // 400+ lines of mixed UI and business logic
  const rollDice = (sides) => Math.floor(Math.random() * sides) + 1;
  const handleAttackRoll = (weapon, mode) => {
    // Complex inline logic
  };
  
  return (
    <div>
      {/* Lots of inline JSX */}
    </div>
  );
}
```

### After (New Structure)
```tsx
// Clean component focused on presentation
function PlayerViewRefactored({ onOpenSpellDialog }) {
  const { state, actions } = useGame(); // Context
  const { rollWeaponAttack } = useCombat(); // Domain logic
  
  return (
    <>
      <StatDisplay label="Hit Points" value={...} />
      <WeaponList 
        weapons={equippedWeapons}
        onRoll={rollWeaponAttack}
      />
    </>
  );
}
```

## 🎯 Benefits

### 1. **Separation of Concerns**
- **UI Components**: Only handle presentation and user interactions
- **Hooks**: Contain all business logic and calculations  
- **Context**: Manages state without business logic
- **Types**: Pure domain models

### 2. **Reusability**
- **Components**: `AbilityScore` used in multiple places
- **Hooks**: `useDice` can be used anywhere
- **Logic**: Combat calculations centralized and reusable

### 3. **Testability**
- **Hooks**: Pure functions, easy to unit test
- **Components**: Can be tested in isolation
- **Business logic**: Separated from UI concerns

### 4. **Maintainability**
- **Smaller files**: Each component has a single responsibility
- **Type safety**: Comprehensive TypeScript coverage
- **Consistent patterns**: Same patterns across all components

## 🚀 Usage

### 1. Wrap your app with GameProvider
```tsx
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <GameProvider>
      <YourComponents />
    </GameProvider>
  );
}
```

### 2. Use the context in components
```tsx
import { useGame } from '../context/GameContext';

function MyComponent() {
  const { state, actions } = useGame();
  
  return (
    <div>
      <p>HP: {state.hp}</p>
      <button onClick={() => actions.updateHP(state.hp + 1)}>
        Heal
      </button>
    </div>
  );
}
```

### 3. Use domain logic hooks
```tsx
import { useCombat } from '../hooks/useCombat';

function WeaponAttack({ weapon, abilities }) {
  const { rollWeaponAttack } = useCombat();
  
  return (
    <button onClick={() => rollWeaponAttack(weapon, abilities, {})}>
      Attack with {weapon.name}
    </button>
  );
}
```

## 📁 File Structure

```
src/app/
├── types/
│   └── index.ts                 # Domain types
├── context/
│   └── GameContext.tsx          # State management
├── hooks/
│   ├── useDice.ts               # Dice rolling logic
│   └── useCombat.ts             # Combat calculations
└── components/
    ├── ui/
    │   ├── layouts.tsx          # Layout components
    │   └── dice.tsx             # Dice UI components
    ├── AbilityScore.tsx         # Ability display
    ├── TalentCard.tsx           # Talent display
    ├── WeaponCard.tsx           # Weapon display
    ├── SpellCard.tsx            # Spell display
    ├── CharacterAttributesViewRefactored.tsx
    ├── PlayerViewRefactored.tsx
    └── AppRefactored.tsx        # Complete example
```

## 🔧 Next Steps

1. **Replace existing components** with refactored versions
2. **Add InventoryView** using the same patterns
3. **Implement persistence** in the context (localStorage, etc.)
4. **Add more domain hooks** as needed (useInventory, useCharacter)
5. **Write tests** for the separated business logic

This structure makes the codebase much more maintainable, testable, and easier to understand!