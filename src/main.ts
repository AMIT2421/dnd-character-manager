import { deleteCharacter, loadCharacter, loadClasses, loadData, loadRaces, saveCharacter, saveData } from "./utils/data.js";
import { rollAbilityScore, rollAbilityScores } from "./utils/dice.js";
import { Character, AbilityScore } from "./interface/characterInterface.js";
import { Subraces, SubraceData, AbilityBonus } from './interface/raceInterfaces';
import { Choice } from './interface/choiceInterface';

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
    const rollManualButton = document.getElementById("rollManually") as HTMLButtonElement;
    const rollAutoButton = document.getElementById("rollAutomatically") as HTMLButtonElement;
    const rollSaveButton = document.getElementById("rollSave") as HTMLButtonElement;

    const rollInput = document.getElementById("rollInput") as HTMLInputElement;

    const strengthSelect = document.getElementById("strengthBase") as HTMLSelectElement;
    const dexteritySelect = document.getElementById("dexterityBase") as HTMLSelectElement;
    const constitutionSelect = document.getElementById("constitutionBase") as HTMLSelectElement;
    const intelligenceSelect = document.getElementById("intelligenceBase") as HTMLSelectElement;
    const wisdomSelect = document.getElementById("wisdomBase") as HTMLSelectElement;
    const charismaSelect = document.getElementById("charismaBase") as HTMLSelectElement;

    const abilitySelects = document.querySelectorAll<HTMLSelectElement>(".ability-select");
    const abilityModifiers = document.querySelectorAll<HTMLDivElement>(".ability-modifier");
    const abilityScores = document.querySelectorAll<HTMLDivElement>(".ability-score");
    let abilityScoreBonusFromRace = document.querySelectorAll<HTMLSelectElement>(".ability-score-choice-from-race");
    
    let AbilityBonusFromRace: Record<string, number> = {
        "strength": 0,
        "dexterity": 0,
        "constitution": 0,
        "intelligence": 0,
        "wisdom": 0,
        "charisma": 0
    };

    for (const [race, raceData] of Object.entries(races)) {
        raceSelect?.appendChild(new Option(raceData.name, race));
    }

    raceSelect.value = '';
    updateSubraces();

    for (const [classValue, classData] of Object.entries(classes)) {
        classSelect?.appendChild(new Option(classData.name, classValue));
    }
    
    classSelect.value = '';

    let abilityScoresRolls = [15, 14, 13, 12, 10, 8];
    let rolled = false;
    assignAbilityScores();
    enforceUniqueSelectValues(abilitySelects);
    updateAbilityValues();;


    //--EVENT LISTENERS--

    rollAutoButton.addEventListener("click", () => {
        if (!rolled) {
            abilityScoresRolls = rollAbilityScores().sort((a, b) => b - a);
            assignAbilityScores();
            enforceUniqueSelectValues(abilitySelects);
            updateAbilityValues();;
            rolled = true;
        }
    });

    rollManualButton.addEventListener("click", () => {
        rollInput.hidden = false;
        rollSaveButton.hidden = false;
        rollInput.value = '';
    });

    rollSaveButton.addEventListener("click", () => {
        const rolls = rollInput.value.split(',').map(r => Number(r));
        if (rolls.length != 6) {
            rollInput.value = "Please input 6 rolls";
            return;
        }
        for (const r of rolls) {
            if (r > 18 || r < 3) {
                rollInput.value = "Rolls must be between 3 and 18";
                return;
            }
        }
        abilityScoresRolls = rolls.sort((a, b) => b - a);
        assignAbilityScores();
        enforceUniqueSelectValues(abilitySelects);
        updateAbilityValues();;
    });

    saveButton.addEventListener("click", () => {
        character = {
            name: nameInput.value,
            race: raceSelect.value,
            subrace: subraceSelect.value,
            classes: [{ name: classSelect.value, level: 1 }],
            abilityScores: [
                { ability: "strength", base: parseInt(strengthSelect.value) },
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
        abilitySelects.forEach(a => a.value = '--');
        updateAbilityValues();
        enforceUniqueSelectValues(abilitySelects);
        updateAbilityValues();;
        deleteCharacter();
    });

    raceSelect.addEventListener("change", () => {
        updateSubraces();
        updateAbilityValues();
        updateAbilityModifiers();
        (document.getElementById('abilityScoreChoice') as HTMLDivElement).innerHTML = '';
        if (races[raceSelect.value].abilityScoreChoice) {
            addChoiceSelect(races[raceSelect.value].abilityScoreChoice as Choice, document.getElementById('abilityScoreChoice') as HTMLDivElement);
            abilityScoreBonusFromRace = document.querySelectorAll<HTMLSelectElement>(".ability-score-choice-from-race");
            abilityScoreBonusFromRace.forEach(bonus => {
                bonus.addEventListener("change", () => {
                    enforceUniqueSelectValues(abilityScoreBonusFromRace);
                    updateAbilityValues();
                })
            });
        }
    });

    subraceSelect.addEventListener("change", () => {
        updateAbilityValues();
    });

    abilitySelects.forEach(select => {
        select.addEventListener("change", () => {
            enforceUniqueSelectValues(abilitySelects);
            updateAbilityValues();;
        });
    });

    

    //--FUNCTIONS--

    function updateSubraces(): void {
        const raceSubraces = races[raceSelect.value] ? races[raceSelect.value].subraces : undefined;
        subraceSelect.hidden = raceSubraces === undefined;
        subraceSelect.innerHTML = '';
        if (raceSubraces !== undefined) {
            for (const [subrace, subraceData] of Object.entries(raceSubraces)) {
                subraceSelect?.appendChild(new Option(subraceData.name, subrace));
            }
        }
    }

    function assignAbilityScores() {
        abilitySelects.forEach(select => {
            select.innerHTML = '';
            select.appendChild(new Option('--'))
            abilityScoresRolls.forEach(score => {
                select.appendChild(new Option((score.toString())));
                select.value = '--';
            });
        });
    }

    function enforceUniqueSelectValues(selectElements: NodeListOf<HTMLSelectElement>) {
        // Gather all currently selected values (excluding placeholders)
        const selectedValues = Array.from(selectElements)
            .map(select => select.value)
            .filter(v => v !== '' && v !== '--');

        selectElements.forEach(select => {
            const currentValue = select.value || null;

            // Copy of selected values excluding the current select’s value
            const others = selectedValues.filter(v => v !== currentValue);

            // Create a count map for how many times each value appears
            const counts: Record<string, number> = {};
            others.forEach(v => {
                counts[v] = (counts[v] || 0) + 1;
            });

            // Loop through each option and enable/disable appropriately
            Array.from(select.options).forEach(option => {
                const val = option.value;
                option.disabled = false;

                if (counts[val] && counts[val] > 0) {
                    option.disabled = true;
                    counts[val]--; // consume one occurrence
                }
            });
        });
    }

    function updateAbilityModifiers() {
        abilityModifiers.forEach(modifier => {
            const skill = modifier.id.substring(0, modifier.id.indexOf('Modifier')); // Get skill
            const score = Number((document.getElementById(skill) as HTMLDivElement).innerHTML) || 10;
            const mod = Math.ceil(score / 2 - 5.5);
            modifier.innerHTML = (mod >= 0 ? '+' : '') + String(mod);
        });
    }

    function updateAbilityValues() {
        AbilityBonusFromRace = {
            "strength": 0,
            "dexterity": 0,
            "constitution": 0,
            "intelligence": 0,
            "wisdom": 0,
            "charisma": 0
        };

        if (races[raceSelect.value] && races[raceSelect.value].abilityScoreChoice) {
            abilityScoreBonusFromRace.forEach(bonus => {
                if (bonus.value !== '--')
                    AbilityBonusFromRace[bonus.value] += 1;
            });
        }
        abilityScores.forEach(score => {
            const select = document.getElementById(score.id + "Base") as HTMLSelectElement;
            if (races[raceSelect.value] && races[raceSelect.value].abilityScoreIncrease[score.id])
                AbilityBonusFromRace[score.id] = races[raceSelect.value].abilityScoreIncrease[score.id];
            if (races[raceSelect.value] && races[raceSelect.value].subraces && races[raceSelect.value].subraces[subraceSelect.value] && races[raceSelect.value].subraces[subraceSelect.value].abilityScoreIncrease[score.id])
                AbilityBonusFromRace[score.id] = races[raceSelect.value].subraces[subraceSelect.value].abilityScoreIncrease[score.id];
            score.innerHTML = String(select.value !== '--' ? Number(select.value) + AbilityBonusFromRace[score.id] : '--');
            score.title = AbilityBonusFromRace[score.id] != 0 ? `${races[raceSelect.value].subraces ? races[raceSelect.value].subraces[subraceSelect.value].name : races[raceSelect.value].name}: ${(AbilityBonusFromRace[score.id] >= 0 ? '+' : '') + AbilityBonusFromRace[score.id]}` : '';
            score.title += score.title != '' ? '; ' : '';
        });
        console.log(AbilityBonusFromRace);
        updateAbilityModifiers();
    }

    function addChoiceSelect(choice: Choice, div: HTMLDivElement) {
        const span = document.createElement('span')
        span.innerHTML = choice.description + '<br>';
        div.appendChild(span)
        for (let i = 0; i < choice.count; i++) {
            const select = document.createElement('select');
            select.id = choice.name + i;
            select.className = choice.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
            select.appendChild(new Option('--'))
            choice.from.options.forEach(opt => {
                select.appendChild(new Option(opt[0].toUpperCase() + opt.slice(1), opt));
            })
            select.value = '--';
            div.appendChild(select);
        }
    }
}

main();