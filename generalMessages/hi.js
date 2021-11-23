import messages from '../messages.json' assert { type: 'json' };
import { randomMath } from '../lib/randomFunctions.js';

const greetings = messages.greetings;

const greetingsSet = new Set(greetings.map(g => g.toLowerCase()));

// say hi
export function execute(msg, filteredMsg) {
    if (greetingsSet.has(filteredMsg)) {
        return greetings[randomMath(greetings.length)];
    }

    return '';
}
