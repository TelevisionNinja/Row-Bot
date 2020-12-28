const { newYear } = require('../messages.json');

module.exports = {
    description: 'Wish a happy new year',
    execute(msg) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0; i < newYear.length; i++) {
            if (msg === newYear[i].toLowerCase()) {
                return {
                    hasReply: true,
                    replyStr: newYear[i]
                };
            }
        }

        return {
            hasReply,
            replyStr
        };
    }
}