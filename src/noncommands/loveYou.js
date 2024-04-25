import messages from '../../config/messages.json' with { type: 'json' };
import { randomInteger } from '../lib/randomFunctions.js';
import { includesPhrase } from '../lib/stringUtils.js';

const loveYous = messages.loveYous,
    loveYouReplies = messages.loveYouReplies,
    kissMes = messages.kissMes,
    kissMeReplies = messages.kissMeReplies;

loveYous.push(...kissMeReplies);
loveYouReplies.push(...kissMeReplies);

// reply to love you's
export function execute(msg, filteredMsg) {
    for (let i = 0, n = loveYous.length; i < n; i++) {
        if (includesPhrase(filteredMsg, loveYous[i], false)) {
            return loveYouReplies[randomInteger(loveYouReplies.length)];
        }
    }

    for (let i = 0, n = kissMes.length; i < n; i++) {
        if (includesPhrase(filteredMsg, kissMes[i], false)) {
            return kissMeReplies[randomInteger(kissMeReplies.length)];
        }
    }

    return '';
}
