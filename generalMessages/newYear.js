const {
    newYear,
    newYearsEve
} = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Wish a happy new year',
    execute(msg, filteredMsg) {
        for (let i = 0, n = newYear.length; i < n; i++) {
            if (filteredMsg === newYear[i].toLowerCase()) {
                return newYear[i];
            }
        }

        for (let i = 0, n = newYearsEve.length; i < n; i++) {
            if (filteredMsg === newYearsEve[i].toLowerCase()) {
                return newYearsEve[rand.randomMath(n)];
            }
        }

        return '';
    }
}