const { goodnights } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Say goodnight',
    execute(msg, filteredMsg) {
        for (let i = 0, n = goodnights.length; i < n; i++) {
            if (filteredMsg === goodnights[i].toLowerCase()) {
                return goodnights[rand.randomMath(n)];
            }
        }

        return '';
    }
}