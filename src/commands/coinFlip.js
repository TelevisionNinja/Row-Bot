import { randomInteger } from '../lib/randomFunctions.js';
import config from '../../config/config.json' assert { type: 'json' };

const coin = config.coin;

export default {
    interactionData: {
        name: coin.names[0],
        description: coin.description,
        options: []
    },
    names: coin.names,
    description: coin.description,
    argsRequired: false,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '',
    cooldown: 0,
    execute(msg, args) {
        if (randomInteger(2)) {
            msg.reply('Heads');
        }
        else {
            msg.reply('Tails');
        }
    },
    executeInteraction(interaction) {
        if (randomInteger(2)) {
            interaction.reply('Heads');
        }
        else {
            interaction.reply('Tails');
        }
    }
}
