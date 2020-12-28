const {
    christmas,
    christmasEve
} = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Wish a merry christmas',
    execute(msg) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0; i < christmas.length; i++) {
            if (msg === christmas[i].toLowerCase()) {
                return {
                    hasReply: true,
                    replyStr: christmas[rand.randomMath(christmas.length)]
                };
            }
        }

        for (let i = 0; i < christmasEve.length; i++) {
            if (msg === christmasEve[i].toLowerCase()) {
                return {
                    hasReply: true,
                    replyStr: christmasEve[rand.randomMath(christmasEve.length)]
                };
            }
        }

        return {
            hasReply,
            replyStr
        };
    }
}