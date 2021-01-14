const {
    loves,
    loveReplies,
    loveMes,
    loveMeReplies
} = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'reply to love you\'s',
    execute(msg) {
        let isNoncommand = false;
        let replyStr = '';

        for (let i = 0, n = loves.length; i < n; i++) {
            if (msg.includes(loves[i].toLowerCase())) {
                return {
                    isNoncommand: true,
                    replyStr: loveReplies[rand.randomMath(loveReplies.length)]
                };
            }
        }

        for (let i = 0, n = loveMes.length; i < n; i++) {
            if (msg.includes(loveMes[i].toLowerCase())) {
                return {
                    isNoncommand: true,
                    replyStr: loveMeReplies[rand.randomMath(loveMeReplies.length)]
                };
            }
        }

        return {
            isNoncommand,
            replyStr
        };
    }
}