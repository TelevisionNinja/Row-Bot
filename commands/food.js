const rand = require('../lib/randomFunctions.js');
const { food } = require('../config.json');

module.exports = {
    names: food.names,
    description: food.description,
    args: false,
    permittedCharsOnly: false,
    guildOnly: false,
    usage: '<type of food>',
    cooldown: 0,
    execute(msg, args) {
        let placeArr = food.places;

        if (args.length) {
            placeArr = placeArr.filter(p => p.type.toLowerCase() === args[0]);
        }

        const len = placeArr.length;

        if (len) {
            const result = placeArr[rand.randomMath(len)].name;
            msg.channel.send(`Your random restaurant is ${result}`);
        }
        else {
            msg.channel.send('I don\'t have any restaurants of that type');
        }
    }
}