import messages from '../../config/messages.json' assert { type: 'json' };
import { randomMath } from '../lib/randomFunctions.js';
import { includesPhrase } from '../lib/stringUtils.js';

const hate = messages.hate,
    sadReplies = messages.sadReplies;

// reply to hate
export function execute(msg, filteredMsg) {
    for (let i = 0, n = hate.length; i < n; i++) {
        if (includesPhrase(filteredMsg, hate[i], false)) {
            return sadReplies[randomMath(sadReplies.length)];
        }
    }

    return '';
}
