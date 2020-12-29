const { tulp } = require('../config.json');

module.exports = {
    names: tulp.names,
    fileName: __filename,
    description: tulp.description,
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