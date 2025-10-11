import { Races } from "../interface/raceInterfaces.js";
import { Classes } from "../interface/classInterfaces.js";

export async function loadRaces(): Promise<Races> {
    const response = await fetch("data/races.json");
    const data: Races = await response.json();
    return data;
}

export async function loadClasses() {
    const response = await fetch("data/classes.json");
    const data: Classes = await response.json();
    return data;
}