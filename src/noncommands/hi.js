import messages from '../../config/messages.json' assert { type: 'json' };
import { randomInteger } from '../lib/randomFunctions.js';

const greetings = messages.greetings;

const greetingsSet = new Set(greetings.map(g => g.toLowerCase()));

// say hi
export function execute(msg, filteredMsg) {
    if (!filteredMsg.length || greetingsSet.has(filteredMsg)) {
        return greetings[randomInteger(greetings.length)];
    }

    return '';
}
