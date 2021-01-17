const { greetings } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');
const arrayUtils = require('../lib/arrayUtils.js');
const { aliases } = require('../config.json');

module.exports = {
    description: 'Say hi',
    execute(words) {
        let hasReply = false;
        let replyStr = '';
        const numOfGreetings = greetings.length;

        for (let i = 0; i < numOfGreetings; i++) {
            if (arrayUtils.isSubArrInOrder(words, greetings[i].toLowerCase().split(' '))) {
                return {
                    hasReply: true,
                    replyStr: greetings[rand.randomMath(numOfGreetings)]
                };
            }
        }

        const wordStr = words.join(' ').replace(/[^a-zA-Z0-9 ]/g, '');

        for (let i = 0, n = aliases.length; i < n; i++) {
            if (wordStr === aliases[i].toLowerCase()) {
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