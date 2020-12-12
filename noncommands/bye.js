module.exports = {
    description: 'Say goodbye',
    execute(msg) {
        const { farewells } = require('../messages.json');

        let isNoncommand = false;
        let replyStr = '';

        for (let i = 0; i < farewells.length; i++) {
            if (msg.includes(farewells[i].toLowerCase())) {
                return { isNoncommand: true, replyStr: farewells[Math.floor(Math.random() * (farewells.length - 1))] };
            }
        }

        return { isNoncommand, replyStr };
    }
}