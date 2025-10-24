import { Choice } from './choiceInterface';
export interface Race {
    name: string;
    subraces?: Subraces;
    abilityScore: {
        fixed?: {[ability: string]: number};
        choice?: Choice;
    };
    speed?: number;
    size?: string;
    languages?: string[];
}

export interface Races {
    [key: string]: Race;
}

export interface SubraceData {
    name: string;
    abilityScore: {
        fixed?: { [ability: string]: number };
        choice?: Choice;
    };
}

export interface Subraces {
    [subrace: string]: SubraceData;
}