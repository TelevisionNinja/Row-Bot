const { farewells } = require('../messages.json');
const rand = require('../lib/randomFunc');

module.exports = {
    description: 'Say goodbye',
    execute(msg) {
        let isNoncommand = false;
        let replyStr = '';

        for (let i = 0; i < farewells.length; i++) {
            if (msg.includes(farewells[i].toLowerCase())) {
                return {
                    isNoncommand: true,
                    replyStr: farewells[rand.randomInt(farewells.length)]
                };
            }
        }

        return { isNoncommand, replyStr };
    }
}