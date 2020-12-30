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
        if (args.length) {
            msg.channel.send(args.join(' '));
        }
        
        if (msg.attachments.size) {
            await msg.channel.send(msg.attachments.map(img => img.url));
        }
        
        await msg.delete();
    }
}