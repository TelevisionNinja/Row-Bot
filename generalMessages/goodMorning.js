import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const goodMornings = messages.goodMornings;

const goodMorningsSet = new Set(goodMornings.map(g => g.toLowerCase()));

// say good morning
export function execute(msg, filteredMsg) {
    if (goodMorningsSet.has(filteredMsg)) {
        return goodMornings[randomMath(goodMornings.length)];
    }

    return '';
}
