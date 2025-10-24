import {
    deleteCharacter,
    loadJson,
    loadCharacter,
    saveCharacter
} from "./utils/data.js";
import { rollAbilityScores } from "./utils/dice.js";
import { Character } from "./interface/characterInterface.js";
import { Choice } from './interface/choiceInterface';
import { Race, Races } from "./interface/raceInterfaces.js";
import { Classes } from "./interface/classInterfaces.js";
import { Backgrounds } from "./interface/backgroundInterface.js";
import { Item, ItemCategory, ItemInstance, Weapon } from './interface/itemInterface';

import _items from '../data/items.json';
type ItemsType = typeof _items

// ---------- GLOBAL STATE ----------
let character: Character = loadCharacter();
let rolled = false;
let abilityScoresRolls = [15, 14, 13, 12, 10, 8];

const ABILITY_NAMES = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
const EMPTY_BONUS: Record<string, number> = Object.fromEntries(ABILITY_NAMES.map(a => [a, 0]));

// ---------- MAIN ----------
async function main() {
    const races = await loadJson<Races>('./data/races.json');
    const classes = await loadJson<Classes>('./data/classes.json');
    const backgrounds = await loadJson<Backgrounds>('./data/backgrounds.json');
    const items = await loadJson<ItemsType>('./data/items.json');

    // --- DOM ELEMENTS ---
    const nameInput = get<HTMLInputElement>("name");
    const raceSelect = get<HTMLSelectElement>("race");
    const subraceSelect = get<HTMLSelectElement>("subrace");
    const classSelect = get<HTMLSelectElement>("class");
    const backgroundSelect = get<HTMLSelectElement>("background")

    const saveBtn = get<HTMLButtonElement>("save");
    const deleteBtn = get<HTMLButtonElement>("delete");
    const rollManualBtn = get<HTMLButtonElement>("rollManually");
    const rollAutoBtn = get<HTMLButtonElement>("rollAutomatically");
    const rollSaveBtn = get<HTMLButtonElement>("rollSave");
    const rollInput = get<HTMLInputElement>("rollInput");

    const abilitySelects = document.querySelectorAll<HTMLSelectElement>(".ability-select");
    const abilityScores = document.querySelectorAll<HTMLDivElement>(".ability-score");
    const abilityModifiers = document.querySelectorAll<HTMLDivElement>(".ability-modifier");
    const abilityChoiceContainer = get<HTMLDivElement>("abilityScoreChoice");
    const equipmentChoiceContainer = get<HTMLDivElement>("equipmentChoice");

    let abilityScoreChoiceSelects = document.querySelectorAll<HTMLSelectElement>(".ability-score-choice-from-race");
    let raceBonuses = { ...EMPTY_BONUS };

    // --- INITIAL SETUP ---
    populateSelect(raceSelect, races);
    populateSelect(classSelect, classes);
    populateSelect(backgroundSelect, backgrounds)
    subraceSelect.hidden = true;

    setupAbilitySelects(abilitySelects, abilityScoresRolls);
    enforceUniqueSelectValues(abilitySelects);
    updateAbilityValues();

    // ---------- EVENT LISTENERS ----------
    rollAutoBtn.addEventListener("click", handleAutoRoll);
    rollManualBtn.addEventListener("click", handleManualRoll);
    rollSaveBtn.addEventListener("click", handleManualSave);
    saveBtn.addEventListener("click", handleSave);
    deleteBtn.addEventListener("click", handleDelete);
    raceSelect.addEventListener("change", handleRaceChange);
    subraceSelect.addEventListener("change", updateAbilityValues);
    abilitySelects.forEach(s => s.addEventListener("change", () => {
        enforceUniqueSelectValues(abilitySelects);
        updateAbilityValues();
    }));
    backgroundSelect.addEventListener("change", handleBackgroundChange);

    // ---------- HANDLERS ----------

    function handleAutoRoll() {
        rollSaveBtn.hidden = true;
        rollInput.hidden = true;
        if (rolled) return;
        abilityScoresRolls = rollAbilityScores().sort((a, b) => b - a);
        setupAbilitySelects(abilitySelects, abilityScoresRolls);
        enforceUniqueSelectValues(abilitySelects);
        updateAbilityValues();
        rolled = true;
    }

    function handleManualRoll() {
        rollInput.hidden = false;
        rollSaveBtn.hidden = false;
        rollInput.value = '';
    }

    function handleManualSave() {
        const rolls = rollInput.value.split(',').map(Number);
        if (rolls.length !== 6 || rolls.some(r => r < 3 || r > 18)) {
            rollInput.value = "Please input 6 rolls (3–18)";
            return;
        }
        abilityScoresRolls = rolls.sort((a, b) => b - a);
        setupAbilitySelects(abilitySelects, abilityScoresRolls);
        enforceUniqueSelectValues(abilitySelects);
        updateAbilityValues();
    }

    function handleSave() {
        character = {
            name: nameInput.value,
            race: raceSelect.value,
            subrace: subraceSelect.value,
            classes: [{ name: classSelect.value, level: 1 }],
            abilityScores: ABILITY_NAMES.map(name => ({
                ability: name,
                base: parseInt(get<HTMLSelectElement>(`${name}Base`).value)
            }))
        };
        saveCharacter(character);
    }

    function handleDelete() {
        [nameInput, raceSelect, classSelect, subraceSelect, backgroundSelect].forEach(el => el.value = '');
        subraceSelect.hidden = true;
        abilityChoiceContainer.innerHTML = '';
        equipmentChoiceContainer.innerHTML = '';
        abilitySelects.forEach(a => a.value = '--');
        updateAbilityValues();
        enforceUniqueSelectValues(abilitySelects);
        deleteCharacter();
    }

    function handleRaceChange() {
        updateSubraces(raceSelect, subraceSelect, races);
        abilityChoiceContainer.innerHTML = '';
        updateAbilityValues();
        updateAbilityModifiers();

        const raceData = races[raceSelect.value];
        if (!raceData?.abilityScore.choice) return;

        addChoiceSelect(raceData.abilityScore.choice, abilityChoiceContainer);
        abilityScoreChoiceSelects = document.querySelectorAll<HTMLSelectElement>(".ability-score-choice-from-race");

        abilityScoreChoiceSelects.forEach(select => {
            select.addEventListener("change", () => {
                enforceUniqueSelectValues(abilityScoreChoiceSelects);
                updateAbilityValues();
            });
        });
    }

    function handleBackgroundChange() {
        console.log("background change");
        equipmentChoiceContainer.innerHTML = '';

        const backgroundData = backgrounds[backgroundSelect.value];

        if (!backgroundData.equipment?.choices) return;
        const equipment = backgroundData.equipment;

        equipment.choices.forEach(choice => {
            addChoiceSelect(choice, equipmentChoiceContainer);
        });


    }

    // ---------- CORE UPDATERS ----------

    function updateAbilityValues() {
        raceBonuses = { ...EMPTY_BONUS };

        const race = races[raceSelect.value];
        const subrace = race?.subraces?.[subraceSelect.value];

        // Race-level fixed bonuses
        if (race?.abilityScore.fixed) {
            Object.assign(raceBonuses, race.abilityScore.fixed);
        }

        // Subrace-level overrides
        if (subrace?.abilityScore.fixed) {
            Object.assign(raceBonuses, subrace.abilityScore.fixed);
        }

        // Chosen bonuses
        if (race?.abilityScore.choice) {
            abilityScoreChoiceSelects.forEach(sel => {
                if (sel.value && sel.value !== '--') {
                    raceBonuses[sel.value] = (raceBonuses[sel.value] || 0) + 1;
                }
            });
        }

        // Update displayed scores and tooltips
        abilityScores.forEach(div => {
            const ability = div.id;
            const baseSelect = get<HTMLSelectElement>(`${ability}Base`);
            const base = baseSelect.value === '--' ? undefined : Number(baseSelect.value);
            const bonus = raceBonuses[ability] || 0;
            div.innerHTML = base ? String(base + bonus) : '--';
            div.title = bonus !== 0 ? `${subrace?.name ?? race?.name}: ${bonus >= 0 ? '+' : ''}${bonus}` : '';
        });

        updateAbilityModifiers();
    }

    function updateAbilityModifiers() {
        abilityModifiers.forEach(mod => {
            const ability = mod.id.replace('Modifier', '');
            const score = Number(get<HTMLDivElement>(ability).innerHTML) || 10;
            const modifier = Math.floor((score - 10) / 2);
            mod.innerHTML = (modifier >= 0 ? '+' : '') + modifier;
        });
    }

    // ---------- HELPER FUNCTIONS ----------

    function extractChoiceOptions(choice: Choice, allOptions?: Record<string, string[]>): Array<string | { itemId: string; name: string }> {
        switch (choice.from.type) {
            case "list":
                return (
                    Array.isArray(choice.from.options)
                        ? choice.from.options
                        : [String(choice.from.options)]
                ) as string[];

            case "all":
                return (allOptions ? Object.values(allOptions).flat() : []) as string[];

            case "category":
                return Object.values(choice.from.options).flat() as string[];

            case "items":
                return (choice.from.options as ItemInstance[]).map(i => {
                    const item = getItemById(items, i.itemId);
                    return { itemId: i.itemId, name: item?.name ?? i.itemId };
                });

            default:
                return [];
        }
    }

    function addChoiceSelect(choice: Choice, container: HTMLDivElement, allOptions?: Record<string, string[]>) {
        const label = document.createElement("span");
        label.innerHTML = (choice.description ?? choice.name) || "";
        container.appendChild(label);

        const options = extractChoiceOptions(choice, allOptions);
        for (let i = 0; i < choice.count; i++) {
            const select = document.createElement("select");
            select.id = `${choice.name}${i}`;
            select.className = `${(choice.name || "")
                .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
                .toLowerCase()}`;
            select.appendChild(new Option("--", "--"));
            options.forEach(opt => {
                if (typeof opt === "string") {
                    select.appendChild(new Option(capitalize(opt), opt));
                } else {
                    select.appendChild(new Option(opt.name, opt.itemId));
                }
            });
            container.appendChild(select);
        }
    }


}

// ---------- HELPER FUNCTIONS ----------

function get<T extends HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
}

function populateSelect(select: HTMLSelectElement, data: Record<string, any>) {
    Object.entries(data).forEach(([key, value]) => {
        select.appendChild(new Option(value.name, key));
    });
    select.value = '--';
}

function setupAbilitySelects(selects: NodeListOf<HTMLSelectElement>, rolls: number[]) {
    selects.forEach(select => {
        select.innerHTML = '';
        select.appendChild(new Option('--'));
        rolls.forEach(score => select.appendChild(new Option(String(score))));
        select.value = '--';
    });
}

function updateSubraces(
    raceSelect: HTMLSelectElement,
    subraceSelect: HTMLSelectElement,
    races: Races
) {
    const race = races[raceSelect.value];
    const subraces = race?.subraces;

    subraceSelect.hidden = !subraces;
    subraceSelect.innerHTML = '';
    if (subraces) {
        Object.entries(subraces).forEach(([key, value]) => {
            subraceSelect.appendChild(new Option(value.name, key));
        });
    }
}

function enforceUniqueSelectValues(selects: NodeListOf<HTMLSelectElement>) {
    const selectedIndices: number[] = Array.from(selects).map(select => select.selectedIndex);

    selects.forEach((select, selectIdx) => {
        Array.from(select.options).forEach((opt, optIdx) => {
            if (opt.value === '--' || opt.value === '') {
                opt.disabled = false;
                return;
            }

            // Count how many other selects have selected this exact option index
            const usedCount = selectedIndices.reduce((acc, idx, i) => {
                if (i !== selectIdx && idx === optIdx) acc++;
                return acc;
            }, 0);

            // Disable if this option index is already used by another select
            opt.disabled = usedCount > 0;
        });
    });
}

function getItemById(items: any, itemId: string) {
    // split path by dot
    const keys = itemId.split('.');
    let obj: any = items;

    for (const key of keys) {
        if (obj[key] === undefined) return undefined;
        obj = obj[key];
    }

    return obj;
}




function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---------- INIT ----------
main();
