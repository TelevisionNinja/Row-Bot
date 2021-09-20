import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const goodMornings = messages.goodMornings,
    goodMorningsLowerCase = goodMornings.map(g => g.toLowerCase());

// say good morning
export function execute(msg, filteredMsg) {
    for (let i = 0, n = goodMornings.length; i < n; i++) {
        if (filteredMsg === goodMorningsLowerCase[i]) {
            return goodMornings[randomMath(n)];
        }
    }

    return '';
}
