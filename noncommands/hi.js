const { greetings } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');
const arrayUtils = require('../lib/arrayUtils.js');

module.exports = {
    description: 'Say hi',
    execute(msg, words) {
        let isNoncommand = false;
        let replyStr = '';
        const numOfGreetings = greetings.length;

        for (let i = 0; i < numOfGreetings; i++) {
            if (arrayUtils.hasSubArrInOrder(words, greetings[i].toLowerCase().split(' '))) {
                return {
                    isNoncommand: true,
                    replyStr: greetings[rand.randomMath(numOfGreetings)]
                };
            }
        }

        return {
            isNoncommand,
            replyStr
        };
    }
}