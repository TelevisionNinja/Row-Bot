const { goodnights } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Say goodnight',
    execute(msg) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0; i < goodnights.length; i++) {
            if (msg === goodnights[i].toLowerCase()) {
                return {
                    hasReply: true,
                    replyStr: goodnights[rand.randomMath(goodnights.length)]
                };
            }
        }

        return { hasReply, replyStr };
    }
}