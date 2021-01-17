const {
    tulp,
    prefix,
    clientID
} = require('../config.json');

module.exports = {
    names: tulp.names,
    fileName: __filename,
    description: tulp.description,
    args: false,
    permittedCharsOnly: false,
    guildOnly: true,
    usage: '<message>',
    cooldown: 0,
    async execute(msg, args) {
        msg.delete();

        if (args.length) {
            let str = msg.content.slice(prefix.length).trim();
            str = str.slice(str.indexOf(' '));

            const authorTulp = tulp.tulpsData.find(t => t.id === msg.author.id);

            if (typeof authorTulp === 'undefined') {
                msg.channel.send(str);
            }
            else {
                const guildWebhooks = await msg.channel.fetchWebhooks();
                let tulpWebhook = undefined;

                for (const webhook of guildWebhooks.values()) {
                    if (webhook.owner.id === clientID) {
                        tulpWebhook = webhook;
                        break;
                    }
                }

                if (typeof tulpWebhook === 'undefined') {
                    try {
                        tulpWebhook = await msg.channel.createWebhook(authorTulp.username, {
                            avatar: authorTulp.avatar
                        });
                    }
                    catch (error) {
                        msg.channel.send('I couldn\'t create a webhook because there\'s too many in here 😢');
                    }
                }
                else {
                    if (tulpWebhook.name !== authorTulp.username || tulpWebhook.avatar !== authorTulp.avatar) {
                        await tulpWebhook.edit({
                            name: authorTulp.username,
                            avatar: authorTulp.avatar
                        });
                    }
                }

                tulpWebhook.send(str);
            }
        }
    }
}