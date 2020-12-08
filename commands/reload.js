module.exports = {
    name: 'reload',
    description: 'Reloads a command',
    args: true,
    usage:'<command>',
    cooldown: 0,
    execute(msg, args) {
        const commandName = args[0].toLowerCase();
        const command = msg.client.commands.get(commandName)
            || msg.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) {
            msg.channel.send(`\'${commandName}\' doesn't exist`);
            return;
        }

        msg.channel.send(`\'${commandName}\' reloaded`);
    }
};