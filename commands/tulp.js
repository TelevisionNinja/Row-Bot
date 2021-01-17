const { tulp } = require('../config.json');

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
        if (args.length) {
            const strArr = msg.content.split(' ');
            strArr.shift();
            const str = strArr.join(' ');

            const authorID = msg.author.id;
            const authorTulp = tulp.tulpsData.find(t => t.id === authorID);

            if (typeof authorTulp === 'undefined') {
                msg.channel.send(str);
                return;
            }

            const tulpWebhook = await msg.channel.createWebhook(authorTulp.username, {
                avatar: authorTulp.avatar,
            });

            tulpWebhook.send(str, { files: msg.attachments.map(img => img.url) });
        }

        await msg.delete();
    }
}