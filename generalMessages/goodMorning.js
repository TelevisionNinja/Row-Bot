const { goodMornings } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Say good morning',
    execute(msg, words) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0, n = goodMornings.length; i < n; i++) {
            if (msg === goodMornings[i].toLowerCase()) {
                return {
                    hasReply: true,
                    replyStr: goodMornings[rand.randomMath(n)]
                };
            }
        }

        return {
            hasReply,
            replyStr
        };
    }
}