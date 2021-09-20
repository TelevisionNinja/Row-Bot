import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const goodnights = messages.goodnights,
    goodnightsLowerCase = goodnights.map(g => g.toLowerCase());

// say goodnight
export function execute(msg, filteredMsg) {
    for (let i = 0, n = goodnights.length; i < n; i++) {
        if (filteredMsg === goodnightsLowerCase[i]) {
            return goodnights[randomMath(n)];
        }
    }

    return '';
}
