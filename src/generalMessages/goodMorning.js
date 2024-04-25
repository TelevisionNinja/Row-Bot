import messages from '../../config/messages.json' with { type: 'json' };
import { randomInteger } from '../lib/randomFunctions.js';

const goodMornings = messages.goodMornings;

const goodMorningsSet = new Set(goodMornings.map(g => g.toLowerCase()));

// say good morning
export function execute(msg, filteredMsg) {
    if (goodMorningsSet.has(filteredMsg)) {
        return goodMornings[randomInteger(goodMornings.length)];
    }

    return '';
}
