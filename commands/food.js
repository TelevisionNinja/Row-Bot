import { randomMath } from '../lib/randomFunctions.js';
import { default as config } from '../config.json';
import { ApplicationCommandOptionTypes } from '../lib/enums.js';

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
                type: ApplicationCommandOptionTypes.STRING
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

        msg.channel.send(message);
    },
    executeInteraction(interaction) {
        const param = interaction.options.get('type');

        let placeArr = food.places;

        if (param) {
            const foodType = param.value.toLowerCase();
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
