import messages from '../../config/messages.json' with { type: 'json' };
import { randomInteger } from '../lib/randomFunctions.js';

const valentines = messages.valentines;

const valentinesSet = new Set(valentines.map(v => v.toLowerCase()));

// wish a happy valentine's day
export function execute(msg, filteredMsg) {
    if (valentinesSet.has(filteredMsg)) {
        return valentines[randomInteger(valentines.length)];
    }

    return '';
}
