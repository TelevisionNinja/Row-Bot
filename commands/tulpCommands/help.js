const {
    prefix,
    help,
    icon,
    names,
    tulp
} = require('../../config.json');
const Discord = require('discord.js');
const msgUtils = require('../../lib/msgUtils.js');

let helpCenter = new Discord.MessageEmbed()
    .setTitle(`${names[0]}\'s Tulp Help Center`)
    .attachFiles(`./${icon}`)
    .setThumbnail(`attachment://${icon}`);
const specific = {
    name: 'Specific Command Info',
    value: `\nSend \`${prefix}${tulp.names[0]} help <command name>\` to get info on a specific command`
};

let notCalled = true;

module.exports = {
    names: help.names,
    description: help.description,
    args: false,
    guildOnly: false,
    usage: '<command name>',
    execute(msg, args) {
        // initialize embed 
        if (notCalled) {
            helpCenter.addFields(
                {
                    name: 'My Tulp Commands',
                    value: msg.client.tulpCommands.map(cmd => `• ${cmd.names[0]}`).join('\n')
                },
                specific
            );
            notCalled = false;
        }

        let embed;

		if (args.length) {
			const userCommand = args[0];
            const argCommand = msg.client.tulpCommands.find(cmd => cmd.names.includes(userCommand));

            if (!argCommand) {
                msgUtils.sendAuthorDm(msg, 'That\'s not one of my tulp commands');
                return;
            }

            embed = new Discord.MessageEmbed()
                .setTitle(argCommand.names[0])
                .setDescription(argCommand.description)
                .addFields(
                    {
                        name: 'Aliases',
                        value: argCommand.names.slice(1).join(', ')
                    },
                    {
                        name: 'Usage',
                        value: `\`${prefix}${argCommand.names[0]} ${argCommand.usage}\``
                    },
                    {
                        name: 'Server Only Command?',
                        value: argCommand.guildOnly ? 'Can only be used in servers' : 'Can be used in DM\'s'
                    }
                );
        }
        else {
            embed = helpCenter
        }

        msgUtils.sendAuthorDm(msg, embed);
    }
}