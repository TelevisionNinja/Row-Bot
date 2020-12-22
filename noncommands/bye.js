const { farewells } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Say goodbye',
    execute(msg) {
        let isNoncommand = false;
        let replyStr = '';

        for (let i = 0; i < farewells.length; i++) {
            if (msg.includes(farewells[i].toLowerCase())) {
                return {
                    isNoncommand: true,
                    replyStr: farewells[rand.randomMath(farewells.length)]
                };
            }
        }

        return { isNoncommand, replyStr };
    }
}