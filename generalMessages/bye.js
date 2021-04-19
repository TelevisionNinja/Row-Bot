const { farewells } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: 'Say goodbye',
    execute(msg, filteredMsg) {
        for (let i = 0, n = farewells.length; i < n; i++) {
            if (filteredMsg === farewells[i].toLowerCase()) {
                return farewells[rand.randomMath(n)];
            }
        }

        return '';
    }
}