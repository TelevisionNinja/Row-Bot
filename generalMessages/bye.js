const { farewells } = require('../messages.json');

module.exports = {
    description: 'Say goodbye',
    execute(msg) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0; i < farewells.length; i++) {
            if (msg === farewells[i].toLowerCase()) {
                return {
                    hasReply: true,
                    replyStr: farewells[Math.floor(Math.random() * (farewells.length - 1))]
                };
            }
        }

        return { hasReply, replyStr };
    }
}