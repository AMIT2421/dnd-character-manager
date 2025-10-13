export interface Race {
    name: string;
    subraces?: string[];
    // abilityBonuses: AbilityBonus[];
    // size: string;
    // speed: number;
    // languages: string[];
}

export interface AbilityBonus {
    abilityScore: string;
    bonus: number;
}

export interface Races {
    [key: string]: Race;
}

export interface Subrace {
    name: string;
}