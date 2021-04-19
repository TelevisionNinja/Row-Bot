const {
    christmas,
    christmasEve
} = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Wish a merry christmas',
    execute(msg, filteredMsg) {
        for (let i = 0, n = christmas.length; i < n; i++) {
            if (filteredMsg === christmas[i].toLowerCase()) {
                return  christmas[rand.randomMath(n)];
            }
        }

        for (let i = 0, n = christmasEve.length; i < n; i++) {
            if (filteredMsg === christmasEve[i].toLowerCase()) {
                return christmasEve[rand.randomMath(n)];
            }
        }

        return '';
    }
}