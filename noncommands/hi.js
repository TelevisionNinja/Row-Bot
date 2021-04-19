const { greetings } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

const greetingsLowerCase = greetings.map(g => g.toLowerCase());

module.exports = {
    description: 'Say hi',
    execute(msg, filteredMsg) {
        const numOfGreetings = greetings.length;

        if (!filteredMsg.length) {
            return greetings[rand.randomMath(numOfGreetings)];
        }

        for (let i = 0; i < numOfGreetings; i++) {
            if (filteredMsg === greetingsLowerCase[i]) {
                return greetings[rand.randomMath(numOfGreetings)];
            }
        }

        return '';
    }
}