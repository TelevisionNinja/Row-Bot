module.exports = {
    description: 'Say good morning',
    execute(msg) {
        const { goodMornings } = require('../messages.json');

        let hasReply = false;
        let replyStr = '';

        for (let i = 0; i < goodMornings.length; i++) {
            if (msg === goodMornings[i].toLowerCase()) {
                return { hasReply: true, replyStr: goodMornings[Math.floor(Math.random() * (goodMornings.length - 1))] };
            }
        }

        return { hasReply, replyStr };
    }
}