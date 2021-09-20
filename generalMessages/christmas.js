import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const christmas = messages.christmas,
    christmasEve = messages.christmasEve,
    christmasLowerCase = christmas.map(c => c.toLowerCase()),
    christmasEveLowerCase = christmasEve.map(c => c.toLowerCase());

// wish a merry christmas
export function execute(msg, filteredMsg) {
    for (let i = 0, n = christmas.length; i < n; i++) {
        if (filteredMsg === christmasLowerCase[i]) {
            return  christmas[randomMath(n)];
        }
    }

    for (let i = 0, n = christmasEve.length; i < n; i++) {
        if (filteredMsg === christmasEveLowerCase[i]) {
            return christmasEve[randomMath(n)];
        }
    }

    return '';
}
