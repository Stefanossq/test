export enum CharacterClass {
  WARRIOR = 'WARRIOR',
  MAGE = 'MAGE',
  ROGUE = 'ROGUE'
}

export interface CharacterStats {
  strength: number;
  intelligence: number;
  speed: number;
  defense: number;
}

export interface CharacterData {
  id: CharacterClass;
  name: string;
  role: string;
  stats: CharacterStats;
  color: string;
  position: [number, number, number];
}

export interface GeneratedLore {
  story: string;
  quote: string;
}
