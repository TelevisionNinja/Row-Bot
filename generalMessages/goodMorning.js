const { goodMornings } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');
const arrayUtils = require('../lib/arrayUtils.js');

module.exports = {
    description: 'Say good morning',
    execute(words) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0, n = goodMornings.length; i < n; i++) {
            if (arrayUtils.isSubArrInOrder(words, goodMornings[i].toLowerCase().split(' '))) {
                return {
                    hasReply: true,
                    replyStr: goodMornings[rand.randomMath(goodMornings.length)]
                };
            }
        }

        return {
            hasReply,
            replyStr
        };
    }
}