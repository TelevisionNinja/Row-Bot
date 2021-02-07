const rand = require('../lib/randomFunctions.js');
const { rps } = require('../config.json');

const choices = new Map();
choices.set('rock', 0);
choices.set('paper', 1);
choices.set('scissors', 2);

module.exports = {
    names: rps.names,
    description: rps.description,
    args: true,
    permittedCharsOnly: false,
    guildOnly: false,
    usage: '<rock, paper, or scissors>',
    cooldown: 0,
    execute(msg, args) {
        const playerChoice = args[0];

        const choiceArr = [...choices.keys()];
        const botChoice = choiceArr[rand.randomMath(choices.size)];

        let winnerMsg = `${botChoice}\n`;

        const valueOfBot = choices.get(botChoice);
        const valueOfPlayer = choices.get(playerChoice);

        if (valueOfBot === valueOfPlayer) {
            winnerMsg = `${winnerMsg}Come on! It\'s a tie!`;
        }
        else if ((valueOfPlayer + 1) % choices.size === valueOfBot) {
            winnerMsg = `${winnerMsg}Yay, I won!`;
        }
        else {
            winnerMsg = `${winnerMsg}Aww, I lost...`;
        }

        msg.channel.send(winnerMsg);
    }
}