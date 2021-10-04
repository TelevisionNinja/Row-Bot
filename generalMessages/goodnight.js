import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const goodnights = messages.goodnights;

const goodnightsSet = new Set(goodnights.map(g => g.toLowerCase()));

// say goodnight
export function execute(msg, filteredMsg) {
    if (goodnightsSet.has(filteredMsg)) {
        return goodnights[randomMath(goodnights.length)];
    }

    return '';
}
