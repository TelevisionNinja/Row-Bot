const { farewells } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Say goodbye',
    execute(msg) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0; i < farewells.length; i++) {
            if (msg === farewells[i].toLowerCase()) {
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