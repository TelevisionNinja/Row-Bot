import messages from '../../config/messages.json' with { type: 'json' };
import { randomInteger } from '../lib/randomFunctions.js';

const greetings = messages.greetings;

const greetingsSet = new Set(greetings.map(g => g.toLowerCase()));

// say hi
export function execute(msg, filteredMsg) {
    if (greetingsSet.has(filteredMsg)) {
        return greetings[randomInteger(greetings.length)];
    }

    return '';
}
