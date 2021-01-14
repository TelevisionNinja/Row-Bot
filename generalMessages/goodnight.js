const { goodnights } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');
const arrayUtils = require('../lib/arrayUtils.js');

module.exports = {
    description: 'Say goodnight',
    execute(words) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0, n = goodnights.length; i < n; i++) {
            if (arrayUtils.isSubArrInOrder(words, goodnights[i].toLowerCase().split(' '))) {
                return {
                    hasReply: true,
                    replyStr: goodnights[rand.randomMath(goodnights.length)]
                };
            }
        }

        return {
            hasReply,
            replyStr
        };
    }
}