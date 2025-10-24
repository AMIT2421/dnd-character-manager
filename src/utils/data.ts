import { Character } from "../interface/characterInterface.js";


export function saveCharacter(character:Character) {
    saveData('character', character);
}

export function deleteCharacter() {
    deleteData('character');
}

export function loadCharacter(): Character {
    return loadData<Character>('character');
}

export async function loadJson<T>(url:string): Promise<T> {
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