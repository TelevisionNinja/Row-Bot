import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const goodMornings = messages.goodMornings,
    goodMorningsLowerCase = goodMornings.map(g => g.toLowerCase());

const goodMorningsMap = new Map();

goodMorningsLowerCase.forEach(g => goodMorningsMap.set(g, true));

// say good morning
export function execute(msg, filteredMsg) {
    if (goodMorningsMap.get(filteredMsg)) {
        return goodMornings[randomMath(goodMornings.length)];
    }

    return '';
}
