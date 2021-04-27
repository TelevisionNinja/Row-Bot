import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';
import { includesPhrase } from '../lib/stringUtils.js';

const hate = messages.hate,
    sadReplies = messages.sadReplies;

export default {
    description: 'Reply to hate',
    execute(msg, filteredMsg) {
        for (let i = 0, n = hate.length; i < n; i++) {
            if (includesPhrase(filteredMsg, hate[i], false)) {
                return sadReplies[randomMath(sadReplies.length)];
            }
        }

        return '';
    }
}