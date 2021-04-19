const { goodMornings } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Say good morning',
    execute(msg, filteredMsg) {
        for (let i = 0, n = goodMornings.length; i < n; i++) {
            if (filteredMsg === goodMornings[i].toLowerCase()) {
                return goodMornings[rand.randomMath(n)];
            }
        }

        return '';
    }
}