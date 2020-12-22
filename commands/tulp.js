module.exports = {
    name: 'tulp',
    fileName: __filename,
    description: 'Testing',
    args: false,
    usage: '<message>',
    cooldown: 0,
    async execute(msg, args) {
        try {
            await msg.delete();
        }
        catch (error) {
            msg.channel.send('I don\'t permission to do that command 😢');
            console.log(error);
            return;
        }

        if (args.length) {
            msg.channel.send(args.join(' '));
        }
    }
}