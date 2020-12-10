module.exports = {
    description: 'Reply to swear',
    execute(msg) {
        const { fu, sadreplies } = require('../config.json');

        for (let i = 0; i < fu.length; i++) {
            if (msg.content.toLowerCase().includes(fu[i].toLowerCase())) {
                msg.channel.send(sadreplies[Math.floor(Math.random() * (sadreplies.length - 1))]);
                
                return true;
            }
        }

        return false;
    }
}