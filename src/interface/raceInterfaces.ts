export interface RaceData {
    name: string;
    subraces?: string[];
    abilityBonuses: AbilityBonus[];
    size: string;
    speed: number;
    languages: string[];
}

export interface AbilityBonus {
    abilityScore: string;
    bonus: number;
}

export interface Races {
    [key: string]: RaceData;
}