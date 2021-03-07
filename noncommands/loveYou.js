const {
    loveYous,
    loveYouReplies,
    kissMes,
    kissMeReplies
} = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

loveYous.push(...kissMeReplies);
loveYouReplies.push(...kissMeReplies);

module.exports = {
    description: 'Reply to love you\'s',
    execute(msg, words) {
        let isNoncommand = false;
        let replyStr = '';

        for (let i = 0, n = loveYous.length; i < n; i++) {
            if (msg.includes(loveYous[i].toLowerCase())) {

                return {
                    isNoncommand: true,
                    replyStr: loveYouReplies[rand.randomMath(loveYouReplies.length)]
                };
            }
        }

        for (let i = 0, n = kissMes.length; i < n; i++) {
            if (msg.includes(kissMes[i].toLowerCase())) {
                return {
                    isNoncommand: true,
                    replyStr: kissMeReplies[rand.randomMath(kissMeReplies.length)]
                };
            }
        }

        return {
            isNoncommand,
            replyStr
        };
    }
}