const { valentines } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Wish a happy valentine\'s day',
    execute(msg, filteredMsg) {
        for (let i = 0, n = valentines.length; i < n; i++) {
            if (filteredMsg === valentines[i].toLowerCase()) {
                return valentines[rand.randomMath(n)];
            }
        }

        return '';
    }
}