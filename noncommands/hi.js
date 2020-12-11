module.exports = {
    description: 'Say hi',
    execute(msg) {
        const { greetings } = require('../config.json');

        let isNoncommand = false;
        let replyStr = '';

        for (let i = 0; i < greetings.length; i++) {
            if (msg.content.toLowerCase().includes(greetings[i].toLowerCase())) {
                return { isNoncommand: true, replyStr: greetings[Math.floor(Math.random() * (greetings.length - 1))] };
            }
        }

        return { isNoncommand, replyStr };
    }
}