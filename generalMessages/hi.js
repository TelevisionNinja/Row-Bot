const { greetings } = require('../messages.json');

module.exports = {
    description: 'Say hi',
    execute(msg) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0; i < greetings.length; i++) {
            if (msg === greetings[i].toLowerCase()) {
                return {
                    hasReply: true,
                    replyStr: greetings[Math.floor(Math.random() * (greetings.length - 1))]
                };
            }
        }

        return { hasReply, replyStr };
    }
}