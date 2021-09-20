import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const greetings = messages.greetings;
const greetingsLowerCase = greetings.map(g => g.toLowerCase());
const greetingsMap = new Map();

greetingsLowerCase.forEach(g => greetingsMap.set(g, true));

// say hi
export function execute(msg, filteredMsg) {
    if (!filteredMsg.length || greetingsMap.get(filteredMsg)) {
        return greetings[randomMath(greetings.length)];
    }

    return '';
}
