import { ItemInstance } from "./itemInterface";

export interface Choice {
    name?: string;
    description?: string;
    count: number;
    type: string;
    from: {
        type: string;
        options: string | string[] | ItemInstance[]
    };
}
