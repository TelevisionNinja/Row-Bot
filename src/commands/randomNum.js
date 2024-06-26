import { randomInteger } from '../lib/randomFunctions.js';
import config from '../../config/config.json' with { type: 'json' };
import { ApplicationCommandOptionType } from 'discord.js';

const random = config.random,
    prefix = config.prefix;

export default {
    interactionData: {
        name: random.names[0],
        description: random.description,
        options: [
            {
                name: 'max',
                description: 'The maximum value of the random number',
                required: true,
                type: ApplicationCommandOptionType.Integer
            },
            {
                name: 'min',
                description: 'The minimum value of the random number',
                required: false,
                type: ApplicationCommandOptionType.Integer
            }
        ]
    },
    names: random.names,
    description: random.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: `<max>\` or \`${prefix}${random.names[0]} <min> <max>`,
    cooldown: 0,
    execute(msg, args) {
        let min = 0;
        const max = parseInt(args[0], 10);

        if (args.length > 1) {
            min = parseInt(args[1], 10);
        }

        if (isNaN(min) || isNaN(max)) {
            msg.reply('Use numbers please');
            return;
        }

        msg.reply(`Your random number is ${randomInteger(min, max + 1)}`);
    },
    executeInteraction(interaction) {
        let min = interaction.options.getInteger('min');
        const max = parseInt(interaction.options.getInteger('max'), 10);

        // optional args will be null if they are not included by the user
        if (min === null) {
            min = 0;
        }
        else {
            min = parseInt(min, 10);
        }

        interaction.reply(`Your random number is ${randomInteger(min, max + 1)}`);
    }
}
