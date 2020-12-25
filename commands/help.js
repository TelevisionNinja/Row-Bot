const { prefix } = require('../config.json');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    name: 'help',
    aliases: ['commands'],
    fileName: __filename,
    description: 'Lists all commands',
    args: false,
    guildOnly: false,
    usage: '<command name>',
    cooldown: 0,
    execute(msg, args) {
        const data = [];
		const { commands } = msg.client;

		if (args.length) {
			const name = args[0];
            const argCommand = msg.client.commands.find(cmd =>
                (cmd.name === name) ||
                (cmd.aliases && cmd.aliases.includes(name)));

            if (!argCommand) {
                sendDm(msg, 'That\'s not one of my commands');
                return;
            }

            data.push(`Command: ${argCommand.name}`);
            data.push(`Aliases: ${argCommand.aliases.join(', ')}`);
            data.push(`Description: ${argCommand.description}`);
            data.push(`Usage: ${prefix}${argCommand.name} ${argCommand.usage}`);
            data.push(`Cooldown: ${argCommand.cooldown} second(s)`);

            sendDm(msg, data);
        }
        else {
            data.push('My commands:\n');
			data.push(commands.map(cmd => cmd.name).join('\n'));
			data.push(`\nSend \`${prefix}help <command name>\` to get info on a specific command`);

            sendDm(msg, data);
        }
    }
}

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