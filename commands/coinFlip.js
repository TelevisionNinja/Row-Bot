const rand = require('../lib/randomFunctions.js');
const { coin } = require('../config.json');

module.exports = {
    names: coin.names,
    description: coin.description,
    argsRequired: false,
    argsOptional: false,
    permittedCharsOnly: false,
    guildOnly: false,
    usage: '',
    cooldown: 0,
    execute(msg, args) {
        if (rand.randomMath(2)) {
            msg.channel.send('Heads');
        }
        else {
            msg.channel.send('Tails');
        }
    }
}