export interface Class {
    name: string;
    subclasses?: Subclass[];
    //hitDie: number;
    //proficiencies: ClassProficiencies;
}

export interface ClassProficiencies {
    armor?: string[];
    weapons?: string[];
    tools?: string[];
    savingThrows: string[];
    skills: string[];
    skillChoices: number;
}

export interface Classes {
    [key: string]: Class;
}

export interface Subclass {
    name: string;
}