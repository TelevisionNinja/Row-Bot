import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const goodMornings = messages.goodMornings;

// say good morning
export function execute(msg, filteredMsg) {
    for (let i = 0, n = goodMornings.length; i < n; i++) {
        if (filteredMsg === goodMornings[i].toLowerCase()) {
            return goodMornings[randomMath(n)];
        }
    }

    return '';
}
