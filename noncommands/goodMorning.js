const { goodMornings } = require('../messages.json');

module.exports = {
    description: 'Say good morning',
    execute(msg) {
        let isNoncommand = false;
        let replyStr = '';

        for (let i = 0; i < goodMornings.length; i++) {
            if (msg.includes(goodMornings[i].toLowerCase())) {
                return {
                    isNoncommand: true,
                    replyStr: goodMornings[Math.floor(Math.random() * (goodMornings.length - 1))]
                };
            }
        }

        return { isNoncommand, replyStr };
    }
}