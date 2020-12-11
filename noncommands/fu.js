module.exports = {
    description: 'Reply to swear',
    execute(msg) {
        const { fu, sadReplies } = require('../config.json');

        for (let i = 0; i < fu.length; i++) {
            if (msg.content.toLowerCase().includes(fu[i].toLowerCase())) {
                msg.channel.send(sadReplies[Math.floor(Math.random() * (sadReplies.length - 1))]);
                
                return true;
            }
        }

        return false;
    }
}