const {
    prefix,
    help,
    icon,
    names,
    tulp
} = require('../../config.json');
const Discord = require('discord.js');
const msgUtils = require('../../lib/msgUtils.js');

const helpCenter = new Discord.MessageEmbed()
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
    async execute(msg, args) {
        // initialize embed 
        if (notCalled) {
            helpCenter.addFields(
                {
                    name: 'My Tulp Commands',
                    value: msg.tulpCommands.map(cmd => `• ${cmd.names[0]}`).join('\n')
                },
                specific
            );
            notCalled = false;
        }
        
		if (args.length) {
			const userCommand = args[0];
            const argCommand = msg.tulpCommands.find(cmd => cmd.names.includes(userCommand));

            if (!argCommand) {
                msgUtils.sendAuthorDm(msg, 'That\'s not one of my tulp commands');
                return;
            }

            const embed = new Discord.MessageEmbed()
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

            msgUtils.sendAuthorDm(msg, embed);
        }
        else {
            msgUtils.sendAuthorDm(msg, helpCenter);
        }
    }
}