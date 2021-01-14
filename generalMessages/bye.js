const { farewells } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');
const arrayUtils = require('../lib/arrayUtils.js');

module.exports = {
    description: 'Say goodbye',
    execute(words) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0, n = farewells.length; i < n; i++) {
            if (arrayUtils.isSubArrInOrder(words, farewells[i].toLowerCase().split(' '))) {
                return {
                    hasReply: true,
                    replyStr: farewells[rand.randomMath(farewells.length)]
                };
            }
        }

        return {
            hasReply,
            replyStr
        };
    }
}