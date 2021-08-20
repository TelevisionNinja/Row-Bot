import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const goodnights = messages.goodnights;

// say goodnight
export function execute(msg, filteredMsg) {
    for (let i = 0, n = goodnights.length; i < n; i++) {
        if (filteredMsg === goodnights[i].toLowerCase()) {
            return goodnights[randomMath(n)];
        }
    }

    return '';
}
