import spellsData from '../../assets/json/spells.json';
import { ImportCharacter, Spell, SpellData } from "./types";

export function importSpells(payload: ImportCharacter) {
  if (payload.spellsKnown && typeof payload.spellsKnown === 'string' && payload.spellsKnown.trim() !== 'None') {
    const spellNames = payload.spellsKnown.split(',').map((s: string) => s.trim()).filter((s: string) => s);
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
          tier: spellInfo.tier,
          duration: spellInfo.duration,
          range: spellInfo.range,
          description: spellInfo.description,
          active: true
        });
      } else {
        newSpells.push({
          id: `spell-${index}`,
          name: spellName,
          tier: 1,
          duration: '',
          range: '',
          description: 'Details not available',
          active: true
        });
      }
    });
    
    return newSpells;
  }
}