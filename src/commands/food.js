import { randomMath } from '../lib/randomFunctions.js';
import config from '../../config/config.json' assert { type: 'json' };
import { ApplicationCommandOptionType } from 'discord.js';

const food = config.food;

export default {
    interactionData: {
        name: food.names[0],
        description: food.description,
        options: [
            {
                name: 'type',
                description: 'The type of food',
                required: false,
                type: ApplicationCommandOptionType.String
            }
        ]
    },
    names: food.names,
    description: food.description,
    argsRequired: false,
    argsOptional: true,
    noSpecialChars: false,
    guildOnly: false,
    usage: '<type of food>',
    cooldown: 0,
    execute(msg, args) {
        let placeArr = food.places;

        if (args.length) {
            const foodType = args.join(' ').toLowerCase();
            placeArr = placeArr.filter(p => p.type.toLowerCase() === foodType);
        }

        const len = placeArr.length;
        let message = '';

        if (len) {
            const result = placeArr[randomMath(len)].name;
            message = `Your random restaurant is ${result}`;
        }
        else {
            message = 'I don\'t have any restaurants of that type';
        }

        msg.reply(message);
    },
    executeInteraction(interaction) {
        let foodType = interaction.options.getString('type');
        let placeArr = food.places;

        if (foodType) {
            foodType = foodType.toLowerCase();
            placeArr = placeArr.filter(p => p.type.toLowerCase() === foodType);
        }

        const len = placeArr.length;
        let message = '';

        if (len) {
            const result = placeArr[randomMath(len)].name;
            message = `Your random restaurant is ${result}`;
        }
        else {
            message = 'I don\'t have any restaurants of that type';
        }

        interaction.reply(message);
    }
}
