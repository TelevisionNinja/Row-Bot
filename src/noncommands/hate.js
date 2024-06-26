import messages from '../../config/messages.json' with { type: 'json' };
import { randomInteger } from '../lib/randomFunctions.js';
import { includesPhrase } from '../lib/stringUtils.js';

const hate = messages.hate,
    sadReplies = messages.sadReplies;

// reply to hate
export function execute(msg, filteredMsg) {
    for (let i = 0, n = hate.length; i < n; i++) {
        if (includesPhrase(filteredMsg, hate[i], false)) {
            return sadReplies[randomInteger(sadReplies.length)];
        }
    }

    return '';
}
