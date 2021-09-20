import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const newYear = messages.newYear,
    newYearsEve = messages.newYearsEve,
    newYearLowerCase = newYear.map(n => n.toLowerCase()),
    newYearsEveLowerCase = newYearsEve.map(n => n.toLowerCase());

const newYearMap = new Map(),
    newYearsEveMap = new Map();

newYearLowerCase.forEach((n, i) => newYearMap.set(n, i));
newYearsEveLowerCase.forEach(n => newYearsEveMap.set(n, true));

// wish a happy new year
export function execute(msg, filteredMsg) {
    const newYearIndex = newYearMap.get(filteredMsg);

    if (typeof newYearIndex !== 'undefined') {
        return newYear[newYearIndex];
    }

    //------------------------

    if (newYearsEveMap.get(filteredMsg)) {
        return newYearsEve[randomMath(newYearsEve.length)];
    }

    return '';
}
