const { greetings } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');
const arrayUtils = require('../lib/arrayUtils.js');
const { clientID } = require('../config.json');

module.exports = {
    description: 'Say hi',
    execute(msg, words) {
        let isNoncommand = false;
        let replyStr = '';
        const numOfGreetings = greetings.length;

        for (let i = 0; i < numOfGreetings; i++) {
            if (arrayUtils.hasSubArrInOrder(words, greetings[i].toLowerCase().split(' '))) {
                isNoncommand = true;
                break;
            }
        }

        if (msg.length > 3) {
            msg = msg.substring(2, msg.length - 1);

            if (msg[0] === '!') {
                msg = msg.substring(1);
            }
        }

        if (isNoncommand || msg === clientID) {
            return {
                isNoncommand: true,
                replyStr: greetings[rand.randomMath(numOfGreetings)]
            };
        }

        return {
            isNoncommand,
            replyStr
        };
    }
}