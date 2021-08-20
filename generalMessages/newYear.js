import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const newYear = messages.newYear,
    newYearsEve = messages.newYearsEve;

// wish a happy new year
export function execute(msg, filteredMsg) {
    for (let i = 0, n = newYear.length; i < n; i++) {
        if (filteredMsg === newYear[i].toLowerCase()) {
            return newYear[i];
        }
    }

    for (let i = 0, n = newYearsEve.length; i < n; i++) {
        if (filteredMsg === newYearsEve[i].toLowerCase()) {
            return newYearsEve[randomMath(n)];
        }
    }

    return '';
}
