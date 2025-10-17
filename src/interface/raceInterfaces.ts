import { Choice } from './choiceInterface';
export interface Race {
    name: string;
    subraces: Subraces;
    abilityScoreIncrease: {[ability: string]: number};
    abilityScoreChoice?:Choice;
    speed?: number;
    size?: string;
    languages?: string[];
    // size: string;
    // speed: number;
    // languages: string[];
}

export interface AbilityBonus {
    AbilityScore: string;
    bonus: number;
    source: string;
}

export interface AbilityBonusMap {
    [ability: string]: AbilityBonus[];
}

export interface Races {
    [key: string]: Race;
}

export interface SubraceData {
    name: string;
    abilityScoreIncrease: {[ability: string]: number};
    abilityScoreChoice?: Choice;
}

export interface Subraces {
    [subrace: string]: SubraceData;
}