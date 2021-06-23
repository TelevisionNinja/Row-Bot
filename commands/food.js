import { randomMath } from '../lib/randomFunctions.js';
import { default as config } from '../config.json';

const food = config.food;

export default {
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

        const foodType = args.join(' ');

        if (args.length) {
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
    }
}