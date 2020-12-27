const { tulpAliases } = require('../config.json');

module.exports = {
    name: 'tulp',
    aliases: tulpAliases,
    fileName: __filename,
    description: 'Sends a tulp message',
    args: false,
    guildOnly: true,
    usage: '<message>',
    cooldown: 0,
    async execute(msg, args) {
        try {
            await msg.delete();
        }
        catch (error) {
            console.log(error);
            return;
        }

        if (args.length) {
            msg.channel.send(args.join(' '));
        }
    }
}