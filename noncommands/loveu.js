const {
    loves,
    loveMes,
    loveMeReplies
} = require('../messages.json');
const rand = require('../lib/randomFunc');

module.exports = {
    description: 'reply to love you\'s',
    execute(msg) {
        let isNoncommand = false;
        let replyStr = '';

        for (let i = 0; i < loves.length; i++) {
            if (msg.includes(loves[i].toLowerCase())) {
                return {
                    isNoncommand: true,
                    replyStr: loves[rand.randomInt(loves.length)]
                };
            }
        }

        for (let i = 0; i < loveMes.length; i++) {
            if (msg.includes(loveMes[i].toLowerCase())) {
                return {
                    isNoncommand: true,
                    replyStr: loveMeReplies[rand.randomInt(loveMeReplies.length)]
                };
            }
        }

        return { isNoncommand, replyStr };
    }
}