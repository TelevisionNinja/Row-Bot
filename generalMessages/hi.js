import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';
import { default as config } from '../config.json';

const names = config.names.map(n => n.toLowerCase()),
    greetings = messages.greetings,
    greetingsLowerCase = greetings.map(g => g.toLowerCase());

const greetingsMap = new Map();

greetingsLowerCase.forEach(g => greetingsMap.set(g, true));
names.forEach(n => greetingsMap.set(n, true));

// say hi
export function execute(msg, filteredMsg) {
    if (greetingsMap.get(filteredMsg)) {
        return greetings[randomMath(greetings.length)];
    }

    return '';
}
