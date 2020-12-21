const {
    loves,
    loveMes,
    loveMeReplies
} = require('../messages.json');

module.exports = {
    description: 'reply to love you\'s',
    execute(msg) {
        let isNoncommand = false;
        let replyStr = '';

        for (let i = 0; i < loves.length; i++) {
            if (msg.includes(loves[i].toLowerCase())) {
                return {
                    isNoncommand: true,
                    replyStr: loves[Math.floor(Math.random() * (loves.length - 1))]
                };
            }
        }

        for (let i = 0; i < loveMes.length; i++) {
            if (msg.includes(loveMes[i].toLowerCase())) {
                return {
                    isNoncommand: true,
                    replyStr: loveMeReplies[Math.floor(Math.random() * (loveMeReplies.length - 1))]
                };
            }
        }

        return { isNoncommand, replyStr };
    }
}