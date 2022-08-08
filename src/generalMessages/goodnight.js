import messages from '../../config/messages.json' assert { type: 'json' };
import { randomInteger } from '../lib/randomFunctions.js';

const goodnights = messages.goodnights;

const goodnightsSet = new Set(goodnights.map(g => g.toLowerCase()));

// say goodnight
export function execute(msg, filteredMsg) {
    if (goodnightsSet.has(filteredMsg)) {
        return goodnights[randomInteger(goodnights.length)];
    }

    return '';
}
