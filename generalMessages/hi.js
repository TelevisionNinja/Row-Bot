const { greetings } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Say hi',
    execute(msg) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0, n = greetings.length; i < n; i++) {
            if (msg === greetings[i].toLowerCase()) {
                return {
                    hasReply: true,
                    replyStr: greetings[rand.randomMath(greetings.length)]
                };
            }
        }

        return {
            hasReply,
            replyStr
        };
    }
}