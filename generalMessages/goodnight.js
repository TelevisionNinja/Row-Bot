const { goodnights } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Say goodnight',
    execute(msg, words) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0, n = goodnights.length; i < n; i++) {
            if (msg === goodnights[i].toLowerCase()) {
                return {
                    hasReply: true,
                    replyStr: goodnights[rand.randomMath(n)]
                };
            }
        }

        return {
            hasReply,
            replyStr
        };
    }
}