import { randomInteger } from '../lib/randomFunctions.js';
import config from '../../config/config.json' with { type: 'json' };
import { ApplicationCommandOptionType } from 'discord.js';

const rps = config.rps;

const choices = new Map();
choices.set('rock', 0);
choices.set('paper', 1);
choices.set('scissors', 2);

const errorMsg = 'Hey! That\'s not rock, paper, or scissors!';

export default {
    interactionData: {
        name: rps.names[0],
        description: rps.description,
        options: [
            {
                name: 'choice',
                description: 'The choice of rock, paper, or scissors',
                required: true,
                type: ApplicationCommandOptionType.String
            }
        ]
    },
    names: rps.names,
    description: rps.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '<rock, paper, or scissors>',
    cooldown: 0,
    execute(msg, args) {
        const valueOfPlayer = choices.get(args[0].toLowerCase());

        if (typeof valueOfPlayer === 'undefined') {
            msg.reply(errorMsg);
            return;
        }

        const choiceArr = [...choices.keys()];
        const botChoice = choiceArr[randomInteger(choices.size)];

        let winnerMsg = `${botChoice}\n`;

        const valueOfBot = choices.get(botChoice);

        if (valueOfBot === valueOfPlayer) {
            winnerMsg = `${winnerMsg}Come on! It\'s a tie!`;
        }
        else if ((valueOfPlayer + 1) % choices.size === valueOfBot) {
            winnerMsg = `${winnerMsg}Yay, I won!`;
        }
        else {
            winnerMsg = `${winnerMsg}Aww, I lost...`;
        }

        msg.reply(winnerMsg);
    },
    executeInteraction(interaction) {
        const valueOfPlayer = choices.get(interaction.options.getString('choice').toLowerCase());

        if (typeof valueOfPlayer === 'undefined') {
            interaction.reply(errorMsg);
            return;
        }

        const choiceArr = [...choices.keys()];
        const botChoice = choiceArr[randomInteger(choices.size)];

        let winnerMsg = `${botChoice}\n`;

        const valueOfBot = choices.get(botChoice);

        if (valueOfBot === valueOfPlayer) {
            winnerMsg = `${winnerMsg}Come on! It\'s a tie!`;
        }
        else if ((valueOfPlayer + 1) % choices.size === valueOfBot) {
            winnerMsg = `${winnerMsg}Yay, I won!`;
        }
        else {
            winnerMsg = `${winnerMsg}Aww, I lost...`;
        }

        interaction.reply(winnerMsg);
    }
}
