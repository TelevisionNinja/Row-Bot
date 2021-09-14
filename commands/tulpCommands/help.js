import { default as config } from '../../config.json';
import { Constants } from 'discord.js';

const prefix = config.prefix,
    help = config.help,
    icon = config.icon,
    names = config.names,
    tulp = config.tulp;

let helpCenter = {
    embeds: [{
        title: `${names[0]}\'s Tulp Help Center`,
        thumbnail: { url: icon },
        color: parseInt(help.embedColor, 16)
    }]
};

// initialize embed
export function initialize(commands) {
    helpCenter.embeds[0].fields = [
        {
            name: 'My Tulp Commands',
            value: commands.map(cmd => `• ${cmd.names[0]}`).join('\n')
        },
        {
            name: 'Specific Command Info',
            value: `Send \`${prefix}${tulp.names[0]} help <command name>\` or \`/${tulp.names[0]} help <command name>\` to get info on a specific command`
        }
    ];
}

export default {
    interactionData: {
        name: help.names[0],
        description: help.description,
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        options: [
            {
                name: 'command',
                description: 'The command to get specific information about',
                required: false,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    },
    names: help.names,
    description: help.description,
    argsRequired: false,
    argsOptional: true,
    guildOnly: false,
    usage: '<command name>',
    execute(msg, args) {
		if (args.length) {
			const userCommand = args[0].toLowerCase();
            const argCommand = msg.client.tulpCommands.get(userCommand);

            if (typeof argCommand === 'undefined') {
                msg.channel.send('That\'s not one of my tulp commands');
                return;
            }

            let usageStr = `\`${prefix}${tulp.names[0]} ${argCommand.names[0]}`;

            if (argCommand.argsRequired) {
                usageStr = `${usageStr} ${argCommand.usage}\``;
            }
            else if (argCommand.argsOptional) {
                usageStr = `${usageStr}\` or ${usageStr} ${argCommand.usage}\``;
            }
            else {
                usageStr = `${usageStr}\``;
            }

            // add slash command example
            usageStr = `Message:\n${usageStr}\nSlash Command:\n\`/${tulp.names[0]} ${argCommand.names[0]}\``;

            const aliases = argCommand.names.slice(1);
            let aliasStr = 'There are no aliases for this command';

            if (aliases.length) {
                aliasStr = aliases.join(', ');
            }

            msg.channel.send({
                embeds: [{
                    title: `Tulp Command: ${argCommand.names[0]}`,
                    description: argCommand.description,
                    color: parseInt(help.embedColor, 16),
                    fields: [
                        {
                            name: 'Aliases',
                            value: aliasStr
                        },
                        {
                            name: 'Usage',
                            value: usageStr
                        },
                        {
                            name: 'Server Only Command?',
                            value: argCommand.guildOnly ? 'Can only be used in servers' : 'Can be used in DM\'s'
                        }
                    ]
                }]
            });
        }
        else {
            msg.channel.send(helpCenter);
        }
    },
    executeInteraction(interaction) {
        const userCommand = interaction.options.get('command');

        if (userCommand) {
            const argCommand = interaction.client.tulpCommands.get(userCommand.value);

            if (typeof argCommand === 'undefined') {
                interaction.reply('That\'s not one of my tulp commands');
                return;
            }

            let usageStr = `\`${prefix}${tulp.names[0]} ${argCommand.names[0]}`;

            if (argCommand.argsRequired) {
                usageStr = `${usageStr} ${argCommand.usage}\``;
            }
            else if (argCommand.argsOptional) {
                usageStr = `${usageStr}\` or ${usageStr} ${argCommand.usage}\``;
            }
            else {
                usageStr = `${usageStr}\``;
            }

            // add slash command example
            usageStr = `Message:\n${usageStr}\nSlash Command:\n\`/${tulp.names[0]} ${argCommand.names[0]}\``;

            const aliases = argCommand.names.slice(1);
            let aliasStr = 'There are no aliases for this command';

            if (aliases.length) {
                aliasStr = aliases.join(', ');
            }

            interaction.reply({
                embeds: [{
                    title: `Tulp Command: ${argCommand.names[0]}`,
                    description: argCommand.description,
                    color: parseInt(help.embedColor, 16),
                    fields: [
                        {
                            name: 'Aliases',
                            value: aliasStr
                        },
                        {
                            name: 'Usage',
                            value: usageStr
                        },
                        {
                            name: 'Server Only Command?',
                            value: argCommand.guildOnly ? 'Can only be used in servers' : 'Can be used in DM\'s'
                        }
                    ]
                }]
            });
        }
        else {
            interaction.reply(helpCenter);
        }
    }
}
