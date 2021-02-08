const {
    prefix,
    help,
    icon,
    names
} = require('../config.json');
const Discord = require('discord.js');
const msgUtils = require('../lib/msgUtils.js');

let helpCenter = new Discord.MessageEmbed()
    .setTitle(`${names[0]}\'s Help Center`)
    .attachFiles(`./${icon}`)
    .setThumbnail(`attachment://${icon}`);
const specific = {
    name: 'Specific Command Info',
    value: `\nSend \`${prefix}help <command name>\` to get info on a specific command`
};

let notCalled = true;

module.exports = {
    names: help.names,
    description: help.description,
    args: false,
    permittedCharsOnly: false,
    guildOnly: false,
    usage: '<command name>',
    cooldown: 0,
    execute(msg, args) {
        // initialize embed
        if (notCalled) {
            helpCenter.addFields(
                {
                    name: 'My Commands',
                    value: msg.client.commands.map(cmd => `• ${cmd.names[0]}`).join('\n')
                },
                specific
            );
            notCalled = false;
        }

        let embed;

		if (args.length) {
			const userCommand = args[0];
            const argCommand = msg.client.commands.find(cmd => cmd.names.includes(userCommand));

            if (!argCommand) {
                msgUtils.sendAuthorDm(msg, 'That\'s not one of my commands');
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
                    },
                    {
                        name: 'Cooldown Time',
                        value: `${argCommand.cooldown} second(s)`
                    }
                );
        }
        else {
            embed = helpCenter;
        }

        msgUtils.sendAuthorDm(msg, embed);
    }
}