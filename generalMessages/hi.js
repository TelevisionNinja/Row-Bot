const { greetings } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');
const arrayUtils = require('../lib/arrayUtils.js');
const { aliases } = require('../config.json');

module.exports = {
    description: 'Say hi',
    execute(words) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0, n = greetings.length; i < n; i++) {
            if (arrayUtils.isSubArrInOrder(words, greetings[i].toLowerCase().split(' '))) {
                return {
                    hasReply: true,
                    replyStr: greetings[rand.randomMath(greetings.length)]
                };
            }
        }

        const wordStr = words.join(' ').replace(/[^a-zA-Z0-9 ]/g, '');

        for (let i = 0, n = aliases.length; i < n; i++) {
            if (wordStr === aliases[i].toLowerCase()) {
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