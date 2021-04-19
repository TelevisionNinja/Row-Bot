const {
    loveYous,
    loveYouReplies,
    kissMes,
    kissMeReplies
} = require('../messages.json');
const rand = require('../lib/randomFunctions.js');
const stringUtils = require('../lib/stringUtils.js');

loveYous.push(...kissMeReplies);
loveYouReplies.push(...kissMeReplies);

module.exports = {
    description: 'Reply to love you\'s',
    execute(msg, filteredMsg) {
        for (let i = 0, n = loveYous.length; i < n; i++) {
            if (stringUtils.includesPhrase(filteredMsg, loveYous[i], false)) {
                return loveYouReplies[rand.randomMath(loveYouReplies.length)];
            }
        }

        for (let i = 0, n = kissMes.length; i < n; i++) {
            if (stringUtils.includesPhrase(filteredMsg, kissMes[i], false)) {
                return kissMeReplies[rand.randomMath(kissMeReplies.length)];
            }
        }

        return '';
    }
}