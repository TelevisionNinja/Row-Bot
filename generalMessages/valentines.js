import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const valentines = messages.valentines,
    valentinesLowerCase = valentines.map(v => v.toLowerCase());

// wish a happy valentine's day
export function execute(msg, filteredMsg) {
    for (let i = 0, n = valentines.length; i < n; i++) {
        if (filteredMsg === valentinesLowerCase[i]) {
            return valentines[randomMath(n)];
        }
    }

    return '';
}
