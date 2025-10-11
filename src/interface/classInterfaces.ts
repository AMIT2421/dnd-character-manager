export interface ClassData {
    name: string;
    subclasses: string[];
    hitDie: number;
    proficiencies: ClassProficiencies;
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
    [key: string]: ClassData;
}