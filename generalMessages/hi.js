const { greetings } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');
let { names } = require('../config.json');

names = names.map(n => n.toLowerCase());

module.exports = {
    description: 'Say hi',
    execute(msg, filteredMsg) {
        const numOfGreetings = greetings.length;

        for (let i = 0; i < numOfGreetings; i++) {
            if (filteredMsg === greetings[i].toLowerCase()) {
                return greetings[rand.randomMath(numOfGreetings)];
            }
        }

        for (let i = 0, n = names.length; i < n; i++) {
            if (filteredMsg === names[i]) {
                return greetings[rand.randomMath(numOfGreetings)];
            }
        }

        return '';
    }
}