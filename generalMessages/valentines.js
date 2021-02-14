const { valentines } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Wish a happy valentine\'s day',
    execute(msg, words) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0, n = valentines.length; i < n; i++) {
            if (msg === valentines[i].toLowerCase()) {
                return {
                    hasReply: true,
                    replyStr: valentines[rand.randomMath(n)]
                };
            }
        }

        return {
            hasReply,
            replyStr
        };
    }
}