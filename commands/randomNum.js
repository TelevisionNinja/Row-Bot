const rand = require('../lib/randomFunctions.js');

module.exports = {
    name: 'random',
    fileName: __filename,
    description: 'Gives a random value within a given range',
    args: true,
    usage: '<min> or <min> <max>',
    cooldown: 1,
    execute(msg, args) {
        let min = 0,
            max = 0,
            result = 0;

        if (args.length === 1) {
            max = parseInt(args[0]);
        }
        else {
            min = parseInt(args[0]);
            max = parseInt(args[1]);
        }

        if (min > max) {
            const temp = max;
            max = min;
            min = temp;
        }

        result = rand.randomMath(min, max + 1);
        
        msg.channel.send(`Your random number is ${result}`);
    }
}