import { loadClasses, loadRaces } from "./utils/data.js";

async function main() {
    const races = await loadRaces();
    const raceSelect = document.getElementById("race") as HTMLSelectElement;
    const subraceSelect = document.getElementById("subrace") as HTMLSelectElement;

    for (const [race, raceData] of Object.entries(races)) {
        raceSelect?.appendChild(new Option(raceData.name, race));
    }

    updateSubraces();
    raceSelect.addEventListener("change", () => {
        updateSubraces();
    });

    function updateSubraces() {
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
}

main()