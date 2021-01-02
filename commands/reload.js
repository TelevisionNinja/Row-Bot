const { reload } = require('../config.json');
const path = require('path');

module.exports = {
    names: reload.names,
    fileName: __filename,
    description: reload.description,
    args: true,
    guildOnly: false,
    usage:'<command>',
    cooldown: 0,
    execute(msg, args) {
        const commandName = args[0];
        const command = msg.client.commands.find(cmd => cmd.names.includes(commandName));

        if (!command) {
            msg.channel.send(`\'${commandName}\' doesn't exist`);
            return;
        }

        delete require.cache[require.resolve(command.fileName)];

        try {
            const newCommand = require(command.fileName);
            msg.client.commands.set(newCommand.names[0], newCommand);
        }
        catch (error) {
            msg.channel.send('Reload failed');
            console.log(error);
            return;
        }

        msg.channel.send(`\'${commandName}\' was reloaded`);
    }
};