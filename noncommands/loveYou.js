import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';
import { includesPhrase } from '../lib/stringUtils.js';

const loveYous = messages.loveYous,
    loveYouReplies = messages.loveYouReplies,
    kissMes = messages.kissMes,
    kissMeReplies = messages.kissMeReplies;

loveYous.push(...kissMeReplies);
loveYouReplies.push(...kissMeReplies);

export default {
    description: 'Reply to love you\'s',
    execute(msg, filteredMsg) {
        for (let i = 0, n = loveYous.length; i < n; i++) {
            if (includesPhrase(filteredMsg, loveYous[i], false)) {
                return loveYouReplies[randomMath(loveYouReplies.length)];
            }
        }

        for (let i = 0, n = kissMes.length; i < n; i++) {
            if (includesPhrase(filteredMsg, kissMes[i], false)) {
                return kissMeReplies[randomMath(kissMeReplies.length)];
            }
        }

        return '';
    }
}