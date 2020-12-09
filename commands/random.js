module.exports = {
    name: 'random',
    description: 'Gives a random value within a given range',
    args: true,
    usage: '<min> <max>',
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

        if (max === min) {
            result = max;
        }
        else {
            if (min > max) {
                let temp = max;
                max = min;
                min = temp;
            }

            result = Math.floor(Math.random() * (max - min + 1)) + min;
        }

        msg.channel.send(`Your random number is ${result}`);
    }
}