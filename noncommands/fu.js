module.exports = {
    description: 'Reply to swear',
    execute(msg) {
        const { fu, sadReplies } = require('../config.json');

        let isNoncommand = false;
        let replyStr = '';

        for (let i = 0; i < fu.length; i++) {
            if (msg.content.toLowerCase().includes(fu[i].toLowerCase())) {
                return { isNoncommand: true, replyStr: sadReplies[Math.floor(Math.random() * (sadReplies.length - 1))] };
            }
        }

        return { isNoncommand, replyStr };
    }
}