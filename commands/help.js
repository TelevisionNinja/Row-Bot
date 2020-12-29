const {
    prefix,
    help
} = require('../config.json');

module.exports = {
    names: help.names,
    fileName: __filename,
    description: help.description,
    args: false,
    guildOnly: false,
    usage: '<command name>',
    cooldown: 0,
    execute(msg, args) {
        const data = [];
		const { commands } = msg.client;

		if (args.length) {
			const userCommand = args[0];
            const argCommand = msg.client.commands.find(cmd => cmd.names.includes(userCommand));

            if (!argCommand) {
                sendDm(msg, 'That\'s not one of my commands');
                return;
            }

            data.push(`Command: ${argCommand.names[0]}`);
            data.push(`Aliases: ${argCommand.names.slice(1).join(', ')}`);
            data.push(`Description: ${argCommand.description}`);
            data.push(`Usage: \`${prefix}${argCommand.names[0]} ${argCommand.usage}\``);
            data.push(`Cooldown: ${argCommand.cooldown} second(s)`);

            sendDm(msg, data);
        }
        else {
            data.push('My commands:\n');
			data.push(commands.map(cmd => cmd.names[0]).join('\n'));
			data.push(`\nSend \`${prefix}help <command name>\` to get info on a specific command`);

            sendDm(msg, data);
        }
    }
}

/**
 * Sends a message to the author's DM's.
 * Splits the message into multiple messages if it exceeds the discord char limit.
 * 
 * @param {*} msg Discord.Message
 * @param {*} data message to be sent through DM's
 */
function sendDm(msg, data) {
    try {
        msg.author.send(data, { split: true });

        if (msg.channel.type === 'dm') {
            return;
        }
        
        msg.reply('I\'ve sent you a DM');
    }
    catch (error) {
        console.log(error);
        msg.reply('I couldn\'t DM you 😢');
    }
}