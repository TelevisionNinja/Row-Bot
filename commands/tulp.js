module.exports = {
    name: 'tulp',
    description: 'Testing',
    args: false,
    usage: '<message>',
    cooldown: 0,
    async execute(msg, args) {
        await msg.delete();
        if (args.length) {
            msg.channel.send(args.join(' '));
        }
    }
}