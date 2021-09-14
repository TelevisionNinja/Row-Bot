import { randomMath } from '../lib/randomFunctions.js';
import { default as config } from '../config.json';
import { Constants } from 'discord.js';

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
                type: Constants.ApplicationCommandOptionTypes.INTEGER
            },
            {
                name: 'min',
                description: 'The minimum value of the random number',
                required: false,
                type: Constants.ApplicationCommandOptionTypes.INTEGER
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
        let max = 0;
        let result = 0;

        if (args.length === 1) {
            max = parseInt(args[0]);
        }
        else {
            min = parseInt(args[0]);
            max = parseInt(args[1]);
        }

        if (isNaN(min) || isNaN(max)) {
            msg.channel.send('Use numbers please');
            return;
        }

        if (min > max) {
            const temp = max;
            max = min;
            min = temp;
        }

        result = randomMath(min, max + 1);

        msg.channel.send(`Your random number is ${result}`);
    },
    executeInteraction(interaction) {
        const min = interaction.options.get('min');
        let minValue = 0;
        let max = parseInt(interaction.options.get('max').value);
        let result = 0;

        if (min) {
            minValue = parseInt(min.value);
        }

        if (minValue > max) {
            const temp = max;
            max = minValue;
            minValue = temp;
        }

        result = randomMath(minValue, max + 1);

        interaction.reply(`Your random number is ${result}`);
    }
}
