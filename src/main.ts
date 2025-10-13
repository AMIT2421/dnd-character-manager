import { setTokenSourceMapRange } from "typescript";
import { deleteCharacter, loadCharacter, loadClasses, loadData, loadRaces, saveCharacter, saveData } from "./utils/data.js";
import { rollAbilityScore, rollAbilityScores } from "./utils/dice.js";
import { Character, AbilityScore } from "./interface/characterInterface.js";


let character: Character = loadCharacter();

async function main() {
    const races = await loadRaces();
    const classes = await loadClasses();
    const nameInput = document.getElementById("name") as HTMLInputElement;
    const raceSelect = document.getElementById("race") as HTMLSelectElement;
    const subraceSelect = document.getElementById("subrace") as HTMLSelectElement;
    const classSelect = document.getElementById("class") as HTMLSelectElement;

    const saveButton = document.getElementById("save") as HTMLButtonElement;
    const deleteButton = document.getElementById("delete") as HTMLButtonElement;
    const resetButton = document.getElementById("reset") as HTMLButtonElement;

    const strengthSelect = document.getElementById("strength") as HTMLSelectElement;
    const dexteritySelect = document.getElementById("dexterity") as HTMLSelectElement;
    const constitutionSelect = document.getElementById("constitution") as HTMLSelectElement;
    const intelligenceSelect = document.getElementById("intelligence") as HTMLSelectElement;
    const wisdomSelect = document.getElementById("wisdom") as HTMLSelectElement;
    const charismaSelect = document.getElementById("charisma") as HTMLSelectElement;
    const abilitySelects = document.querySelectorAll<HTMLSelectElement>(".ability-select")

    for (const [race, raceData] of Object.entries(races)) {
        raceSelect?.appendChild(new Option(raceData.name, race));
    }

    for (const [classValue, classData] of Object.entries(classes)) {
        classSelect?.appendChild(new Option(classData.name, classValue));
    }

    updateSubraces();



    let abilityScores = rollAbilityScores().sort((a, b) => b - a);

    assingAbilityScores();
    updateAbilityScores();

    //--EVENT LISTENERS--

    saveButton.addEventListener("click", () => {
        character = {
            name: nameInput.value,
            race: raceSelect.value,
            subrace: subraceSelect.value,
            classes: [{ name: classSelect.value, level: 1 }],
            abilityScores: [
                { ability: "strength", base: parseInt(strengthSelect.value)},
                { ability: "dexterity", base: parseInt(dexteritySelect.value) },
                { ability: "constitution", base: parseInt(constitutionSelect.value) },
                { ability: "intelligence", base: parseInt(intelligenceSelect.value) },
                { ability: "wisdom", base: parseInt(wisdomSelect.value) },
                { ability: "charisma", base: parseInt(charismaSelect.value) },
            ]
        }
        saveCharacter(character);
    });
    
    deleteButton.addEventListener("click", () => {
        nameInput.value = '';
        raceSelect.value = '';
        classSelect.value = '';
        subraceSelect.value = '';
        subraceSelect.hidden = true;
        deleteCharacter();
    });

    resetButton.addEventListener("click", () => {
        abilitySelects.forEach(select => select.value = '');
        updateAbilityScores();
    });
    
    raceSelect.addEventListener("change", () => updateSubraces());
    
    abilitySelects.forEach(select => {
        select.addEventListener("change", () => {
            updateAbilityScores();
        })
    });

    
    
    
    //--FUNCTIONS--
    
    function updateSubraces(): void {
        const subraces = races[raceSelect.value].subraces;
        subraceSelect.hidden = true;
        subraceSelect.innerHTML = '';
        if (subraces) {
            subraces.forEach(subrace => {
                subraceSelect.appendChild(new Option(subrace, subrace.toLowerCase()));
            });
            subraceSelect.hidden = false;
        }
    }
    
    function assingAbilityScores() {
        abilitySelects.forEach(select => {
            abilityScores.forEach(score => {
                select.appendChild(new Option((score.toString())));
                select.value = '';
            });
        });
    }
    
    function updateAbilityScores() {
        // Collect selected values
        const selectedValues = Array.from(abilitySelects)
            .map(select => select.value)
            .filter(v => v !== '')
            .map(v => parseInt(v));
    
        abilitySelects.forEach(select => {
            const myValue = select.value ? parseInt(select.value) : null;
    
            // Create a copy of selectedValues without counting this select
            const otherSelectedValues = selectedValues.filter(v => v !== myValue);
    
            // Count how many times each value has been selected
            const valueCounts: Record<number, number> = {};
            otherSelectedValues.forEach(val => {
                valueCounts[val] = (valueCounts[val] || 0) + 1;
            });
    
            // Go through options
            Array.from(select.options).forEach(option => {
                const optionValue = parseInt(option.value);
                option.disabled = false;
    
                // Disable option if there’s still a “count” of this value to consume
                if (valueCounts[optionValue] > 0) {
                    option.disabled = true;
                    valueCounts[optionValue]--; // consume one occurrence
                }
            });
        });
    }
    
}

main();