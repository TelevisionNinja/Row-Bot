module.exports = {
    description: 'Reply to hate',
    execute(msg) {
        const { hate, sadReplies } = require('../config.json');

        let isNoncommand = false;
        let replyStr = '';

        for (let i = 0; i < hate.length; i++) {
            if (msg.content.toLowerCase().includes(hate[i].toLowerCase())) {
                return { isNoncommand: true, replyStr: sadReplies[Math.floor(Math.random() * (sadReplies.length - 1))] };
            }
        }

        return { isNoncommand, replyStr };
    }
}