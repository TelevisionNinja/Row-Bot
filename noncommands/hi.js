const { greetings } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Say hi',
    execute(msg) {
        let isNoncommand = false;
        let replyStr = '';

        for (let i = 0; i < greetings.length; i++) {
            if (msg.includes(greetings[i].toLowerCase())) {
                return {
                    isNoncommand: true,
                    replyStr: greetings[rand.randomMath(greetings.length)]
                };
            }
        }

        return {
            isNoncommand,
            replyStr
        };
    }
}