const {
    newYear,
    newYearsEve
} = require('../messages.json');

module.exports = {
    description: 'Wish a happy new year',
    execute(msg) {
        let hasReply = false;
        let replyStr = '';

        for (let i = 0, n = newYear.length; i < n; i++) {
            if (msg === newYear[i].toLowerCase()) {
                return {
                    hasReply: true,
                    replyStr: newYear[i]
                };
            }
        }

        for (let i = 0, n = newYearsEve.length; i < n; i++) {
            if (msg === newYearsEve[i].toLowerCase()) {
                return {
                    hasReply: true,
                    replyStr: newYearsEve[i]
                };
            }
        }

        return {
            hasReply,
            replyStr
        };
    }
}