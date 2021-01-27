const { greetings } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');
const { names } = require('../config.json');

module.exports = {
    description: 'Say hi',
    execute(msg, words) {
        let hasReply = false;
        let replyStr = '';
        const numOfGreetings = greetings.length;

        for (let i = 0; i < numOfGreetings; i++) {
            if (msg === greetings[i].toLowerCase()) {
                return {
                    hasReply: true,
                    replyStr: greetings[rand.randomMath(numOfGreetings)]
                };
            }
        }

        for (let i = 0, n = names.length; i < n; i++) {
            if (msg === names[i].toLowerCase()) {
                return {
                    hasReply: true,
                    replyStr: greetings[rand.randomMath(numOfGreetings)]
                };
            }
        }

        return {
            hasReply,
            replyStr
        };
    }
}