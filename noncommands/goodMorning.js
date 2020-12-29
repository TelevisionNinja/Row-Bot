const { goodMornings } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Say good morning',
    execute(msg) {
        let isNoncommand = false;
        let replyStr = '';

        for (let i = 0, n = goodMornings.length; i < n; i++) {
            if (msg.includes(goodMornings[i].toLowerCase())) {
                return {
                    isNoncommand: true,
                    replyStr: goodMornings[rand.randomMath(goodMornings.length)]
                };
            }
        }

        return {
            isNoncommand,
            replyStr
        };
    }
}