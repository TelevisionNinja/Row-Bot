import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const valentines = messages.valentines;

const valentinesSet = new Set(valentines.map(v => v.toLowerCase()));

// wish a happy valentine's day
export function execute(msg, filteredMsg) {
    if (valentinesSet.has(filteredMsg)) {
        return valentines[randomMath(valentines.length)];
    }

    return '';
}
