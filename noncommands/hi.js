module.exports = {
    description: 'Say hi',
    args: false,
    execute(msg) {
        const { greetings } = require('../config.json');
        for (let i = 0; i < greetings.length; i++) {
            if (msg.content.toLowerCase().includes(greetings[i].toLowerCase())) {
                msg.channel.send(greetings[Math.floor(Math.random() * (greetings.length - 1))]);
                return true;
            }
        }
        return false;
    }
}