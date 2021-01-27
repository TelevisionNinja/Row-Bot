const {
    hate,
    sadReplies
} = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Reply to hate',
    execute(msg, words) {
        let isNoncommand = false;
        let replyStr = '';

        for (let i = 0, n = hate.length; i < n; i++) {
            if (msg.includes(hate[i].toLowerCase())) {
                return {
                    isNoncommand: true,
                    replyStr: sadReplies[rand.randomMath(sadReplies.length)]
                };
            }
        }

        return {
            isNoncommand,
            replyStr
        };
    }
}