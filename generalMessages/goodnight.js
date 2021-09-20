import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const goodnights = messages.goodnights,
    goodnightsLowerCase = goodnights.map(g => g.toLowerCase());

const goodnightsMap = new Map();

goodnightsLowerCase.forEach(g => goodnightsMap.set(g, true));

// say goodnight
export function execute(msg, filteredMsg) {
    if (goodnightsMap.get(filteredMsg)) {
        return goodnights[randomMath(goodnights.length)];
    }

    return '';
}
