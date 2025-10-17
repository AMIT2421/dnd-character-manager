import { Races} from "../interface/raceInterfaces.js";
import { Classes } from "../interface/classInterfaces.js";
import { Character } from "../interface/characterInterface.js";

export async function loadRaces(): Promise<Races> {
    return await loadJson<Races>("data/races.json");
}

export async function loadClasses(): Promise<Classes> {
    return await loadJson<Classes>("data/classes.json");
}

export function saveCharacter(character:Character) {
    saveData('character', character);
}

export function deleteCharacter() {
    deleteData('character');
}

export function loadCharacter(): Character {
    return loadData<Character>('character');
}

async function loadJson<T>(url:string): Promise<T> {
    const response = await fetch(url);
    const data: T = await response.json();
    return data;
}

export function saveData(url:string, data:any) {
    localStorage.setItem(url, JSON.stringify(data || {}));
}

export function loadData<T>(url:string): T {
    return JSON.parse(localStorage.getItem(url) || '{}');
}

function deleteData<T>(url:string) {
    localStorage.removeItem(url);
}