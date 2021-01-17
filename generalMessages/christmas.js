const {
    christmas,
    christmasEve
} = require('../messages.json');
const rand = require('../lib/randomFunctions.js');
const arrayUtils = require('../lib/arrayUtils.js');

module.exports = {
    description: 'Wish a merry christmas',
    execute(words) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0, n = christmas.length; i < n; i++) {
            if (arrayUtils.isSubArrInOrder(words, christmas[i].toLowerCase().split(' '))) {
                return {
                    hasReply: true,
                    replyStr: christmas[rand.randomMath(n)]
                };
            }
        }

        for (let i = 0, n = christmasEve.length; i < n; i++) {
            if (arrayUtils.isSubArrInOrder(words, christmasEve[i].toLowerCase().split(' '))) {
                return {
                    hasReply: true,
                    replyStr: christmasEve[rand.randomMath(n)]
                };
            }
        }

        return {
            hasReply,
            replyStr
        };
    }
}