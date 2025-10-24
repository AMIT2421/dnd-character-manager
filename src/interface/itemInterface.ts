export interface ItemBase {
    name: string;
    cost?: string;
    weight?: number;
    description?: string;
}

export interface Weapon extends ItemBase {
    weaponType: "simple" | "martial";
    rangeType: "melee" | "ranged";
    damage?: {
        dice: string;
        type: string;
        versatile?: string;
    };

    range?: {
        normal: number;
        long?: number;
    }

    properties?: string[];

    ammoType?: string;
}

export interface Armor extends ItemBase {
    armorClass?: number;
    dexBonus?: boolean;
    dexCap?: number;
    disadvantageStealth?: boolean;
}

export interface ItemCategory {
    [key: string]: Item | ItemCategory; // nested (for subcategories)
}

export type Item = ItemBase | Weapon | Armor;

export interface ItemInstance {
    itemId: string;
    quantity?: number;
}