import messages from '../config/messages.json' assert { type: 'json' };
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
