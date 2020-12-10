module.exports = {
    description: 'Say goodbye',
    execute(msg) {
        const { farewells } = require('../config.json');
        for (let i = 0; i < farewells.length; i++) {
            if (msg.content.toLowerCase().includes(farewells[i].toLowerCase())) {
                msg.channel.send(farewells[Math.floor(Math.random() * (farewells.length - 1))]);
                return true;
            }
        }
        return false;
    }
}