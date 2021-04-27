import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const christmas = messages.christmas,
    christmasEve = messages.christmasEve;

export default {
    description: 'Wish a merry christmas',
    execute(msg, filteredMsg) {
        for (let i = 0, n = christmas.length; i < n; i++) {
            if (filteredMsg === christmas[i].toLowerCase()) {
                return  christmas[randomMath(n)];
            }
        }

        for (let i = 0, n = christmasEve.length; i < n; i++) {
            if (filteredMsg === christmasEve[i].toLowerCase()) {
                return christmasEve[randomMath(n)];
            }
        }

        return '';
    }
}