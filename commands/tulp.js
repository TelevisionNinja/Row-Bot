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
        const msgCopy = msg;
        msg.delete();

        if (args.length) {
            let str = msgCopy.content.slice(prefix.length).trim();
            str = str.slice(str.indexOf(' '));

            const authorID = msgCopy.author.id;
            const authorTulp = tulp.tulpsData.find(t => t.id === authorID);

            if (typeof authorTulp === 'undefined') {
                msgCopy.channel.send(str);
            }
            else {
                const guildWebhooks = await msgCopy.channel.fetchWebhooks();
                let tulpWebhook = undefined;

                for (const webhook of guildWebhooks.values()) {
                    if (webhook.owner.id === clientID) {
                        tulpWebhook = webhook;
                        break;
                    }
                }

                if (typeof tulpWebhook === 'undefined') {
                    try {
                        tulpWebhook = await msgCopy.channel.createWebhook(authorTulp.username, {
                            avatar: authorTulp.avatar
                        });
                    }
                    catch (error) {
                        msgCopy.channel.send('I couldn\'t create a webhook because there\'s too many in here 😢');
                    }
                }
                else {
                    await tulpWebhook.edit({
                        name: authorTulp.username,
                        avatar: authorTulp.avatar
                    });
                }

                tulpWebhook.send(str);
            }
        }
    }
}