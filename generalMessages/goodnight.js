module.exports = {
    description: 'Say goodnight',
    execute(msg) {
        const { goodnights } = require('../messages.json');

        let hasReply = false;
        let replyStr = '';

        for (let i = 0; i < goodnights.length; i++) {
            if (msg === goodnights[i].toLowerCase()) {
                return { hasReply: true, replyStr: goodnights[Math.floor(Math.random() * (goodnights.length - 1))] };
            }
        }

        return { hasReply, replyStr };
    }
}