export interface Character {
    name: string;
    race: string;
    subrace?: string;
    classes: characterClass[];
    abilityScores: AbilityScore[];
    abilityScoreIncreases?: {
        race?: AbilityScore[];
        background?: AbilityScore[];
    }
}

export interface AbilityScore {
    ability: string; //"strengh", "dexterity", etc
    base: number;
}

export interface characterClass {
    name: string;
    subclass?: string;
    level: number;
}