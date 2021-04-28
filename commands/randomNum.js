import { randomMath } from '../lib/randomFunctions.js';
import { default as config } from '../config.json';

const random = config.random,
    prefix = config.prefix;

export default {
    names: random.names,
    description: random.description,
    argsRequired: true,
    argsOptional: false,
    permittedCharsOnly: false,
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
    }
}