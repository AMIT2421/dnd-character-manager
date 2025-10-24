import { Choice } from './choiceInterface';
import { ItemInstance } from './itemInterface';

export interface Backgrounds {
    [key: string]: Background;
}

export interface Background {
    name: string;
    skillProficiencies?: string[];
    toolProficiencies?: {
        fixed?: string[];
        choice?: Choice[];
    }
    languages?: Choice;
    equipment?: {
        fixed?: ItemInstance[];
        choices: Choice[];
    }
}