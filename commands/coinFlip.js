import { randomMath } from '../lib/randomFunctions.js';
import { default as config } from '../config.json';

const coin = config.coin;

export default {
    names: coin.names,
    description: coin.description,
    argsRequired: false,
    argsOptional: false,
    permittedCharsOnly: false,
    guildOnly: false,
    usage: '',
    cooldown: 0,
    execute(msg, args) {
        if (randomMath(2)) {
            msg.channel.send('Heads');
        }
        else {
            msg.channel.send('Tails');
        }
    }
}