module.exports = {
    name: 'reload',
    fileName: __filename,
    description: 'Reloads a command',
    args: true,
    usage:'<command>',
    cooldown: 0,
    execute(msg, args) {
        const commandName = args[0].toLowerCase();
        const command = msg.client.commands.find(cmd =>
            (cmd.name === commandName) ||
            (cmd.aliases && cmd.aliases.includes(commandName)));

        if (!command) {
            msg.channel.send(`\'${commandName}\' doesn't exist`);
            return;
        }

        delete require.cache[require.resolve(command.fileName)];

        try {
            const newCommand = require(command.fileName);
            msg.client.commands.set(newCommand.name, newCommand);
        }
        catch (error) {
            msg.channel.send('Reload failed');
            console.log(error);
            return;
        }

        msg.channel.send(`\'${commandName}\' was reloaded`);
    }
};