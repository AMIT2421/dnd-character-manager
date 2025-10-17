export interface Choice {
    name: string;
    description: string;
    count: number;
    type: string;
    from: {options: string[];}
}