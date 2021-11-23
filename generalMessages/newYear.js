import messages from '../messages.json' assert { type: 'json' };
import { randomMath } from '../lib/randomFunctions.js';

const newYear = messages.newYear,
    newYearsEve = messages.newYearsEve,
    newYearLowerCase = newYear.map(n => n.toLowerCase());

const newYearMap = new Map(),
    newYearsEveSet = new Set(newYearsEve.map(n => n.toLowerCase()));

newYearLowerCase.forEach((n, i) => newYearMap.set(n, i));

// wish a happy new year
export function execute(msg, filteredMsg) {
    const newYearIndex = newYearMap.get(filteredMsg);

    if (typeof newYearIndex !== 'undefined') {
        return newYear[newYearIndex];
    }

    //------------------------

    if (newYearsEveSet.has(filteredMsg)) {
        return newYearsEve[randomMath(newYearsEve.length)];
    }

    return '';
}
