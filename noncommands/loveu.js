module.exports = {
    description: 'reply to love you\'s',
    execute(msg) {
        const { loves } = require('../config.json');

        let isNoncommand = false;
        let replyStr = '';

        for (let i = 0; i < loves.length; i++) {
            if (msg.content.toLowerCase().includes(loves[i].toLowerCase())) {
                return { isNoncommand: true, replyStr: loves[Math.floor(Math.random() * (loves.length - 1))] };
            }
        }

        return { isNoncommand, replyStr };
    }
}