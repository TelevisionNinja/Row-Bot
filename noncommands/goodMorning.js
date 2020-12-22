const { goodMornings } = require('../messages.json');
const rand = require('../lib/randomFunc');

module.exports = {
    description: 'Say good morning',
    execute(msg) {
        let isNoncommand = false;
        let replyStr = '';

        for (let i = 0; i < goodMornings.length; i++) {
            if (msg.includes(goodMornings[i].toLowerCase())) {
                return {
                    isNoncommand: true,
                    replyStr: goodMornings[rand.randomInt(goodMornings.length)]
                };
            }
        }

        return { isNoncommand, replyStr };
    }
}