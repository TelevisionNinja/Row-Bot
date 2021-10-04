import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const greetings = messages.greetings;

const greetingsSet = new Set(greetings.map(g => g.toLowerCase()));

// say hi
export function execute(msg, filteredMsg) {
    if (!filteredMsg.length || greetingsSet.has(filteredMsg)) {
        return greetings[randomMath(greetings.length)];
    }

    return '';
}
