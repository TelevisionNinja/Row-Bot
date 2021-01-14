const {
    newYear,
    newYearsEve
} = require('../messages.json');
const arrayUtils = require('../lib/arrayUtils.js');

module.exports = {
    description: 'Wish a happy new year',
    execute(words) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0, n = newYear.length; i < n; i++) {
            if (arrayUtils.isSubArrInOrder(words, newYear[i].toLowerCase().split(' '))) {
                return {
                    hasReply: true,
                    replyStr: newYear[i]
                };
            }
        }

        for (let i = 0, n = newYearsEve.length; i < n; i++) {
            if (arrayUtils.isSubArrInOrder(words, newYearsEve[i].toLowerCase().split(' '))) {
                return {
                    hasReply: true,
                    replyStr: newYearsEve[i]
                };
            }
        }

        return {
            hasReply,
            replyStr
        };
    }
}