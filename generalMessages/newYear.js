import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const newYear = messages.newYear,
    newYearsEve = messages.newYearsEve,
    newYearLowerCase = newYear.map(n => n.toLowerCase()),
    newYearsEveLowerCase = newYearsEve.map(n => n.toLowerCase());

// wish a happy new year
export function execute(msg, filteredMsg) {
    for (let i = 0, n = newYear.length; i < n; i++) {
        if (filteredMsg === newYearLowerCase[i]) {
            return newYear[i];
        }
    }

    for (let i = 0, n = newYearsEve.length; i < n; i++) {
        if (filteredMsg === newYearsEveLowerCase[i]) {
            return newYearsEve[randomMath(n)];
        }
    }

    return '';
}
