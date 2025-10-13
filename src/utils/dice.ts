export function rollDie(sides: number): number{
    return Math.floor((Math.random() * sides)) + 1;
}

export function rollDice(count: number = 1, sides: number): number[] {// i.e. rollDice(4, 6) = roll 4d6
    const results = [];
    for (let i = 0; i < count; i++){
        results.push(rollDie(sides))
    }
    return results;
}

export function rollAbilityScore(): number { //Roll 4d6, remove the smallest roll
    const rolls = rollDice(4, 6);
    const min = Math.min(...rolls);
    const index = rolls.indexOf(min);
    rolls.splice(index, 1);
    const sum = rolls.reduce((a, b) => a + b, 0)
    return sum;
}

export function rollAbilityScores(): number[] {
    const scores = []
    for (let i = 0; i < 6; i++){
        scores.push(rollAbilityScore());
    }
    return scores;
}