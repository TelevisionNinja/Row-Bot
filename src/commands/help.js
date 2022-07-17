import config from '../../config/config.json' assert { type: 'json' };
import { ApplicationCommandOptionType } from 'discord.js';

const prefix = config.prefix,
    help = config.help,
    icon = config.icon,
    names = config.names;

let helpCenter = {
    embeds: [{
        title: `${names[0]}\'s Help Center`,
        thumbnail: { url: icon },
        color: parseInt(help.embedColor, 16)
    }]
};

// initialize embed
export function initialize(commands) {
    helpCenter.embeds[0].fields = [
        {
            name: 'My Commands',
            value: commands.map(cmd => `• ${cmd.names[0]}`).join('\n')
        },
        {
            name: 'Specific Command Info',
            value: `Send \`${prefix}help <command name>\` or \`/help <command name>\` to get info on a specific command`
        }
    ];
}

export default {
    interactionData: {
        name: help.names[0],
        description: help.description,
        options: [
            {
                name: 'command',
                description: 'The command to get specific information about',
                required: false,
                type: ApplicationCommandOptionType.String
            }
        ]
    },
    names: help.names,
    description: help.description,
    argsRequired: false,
    argsOptional: true,
    noSpecialChars: false,
    guildOnly: false,
    usage: '<command name>',
    cooldown: 0,
    execute(msg, args) {
        if (args.length) {
            const userCommand = args[0].toLowerCase();
            const argCommand = msg.client.commands.get(userCommand);

            if (typeof argCommand === 'undefined') {
                msg.reply('That\'s not one of my commands');
                return;
            }

            let usageStr = `\`${prefix}${argCommand.names[0]}`;

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
            usageStr = `Message:\n${usageStr}\nSlash Command:\n\`/${argCommand.names[0]}\``;

            const aliases = argCommand.names.slice(1);
            let aliasStr = 'There are no aliases for this command';

            if (aliases.length) {
                aliasStr = aliases.join(', ');
            }

            msg.reply({
                embeds: [{
                    title: `Command: ${argCommand.names[0]}`,
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
                        },
                        {
                            name: 'Cooldown Time',
                            value: `${argCommand.cooldown} second(s)`
                        }
                    ]
                }]
            });
        }
        else {
            msg.reply(helpCenter);
        }
    },
    executeInteraction(interaction) {
        const userCommand = interaction.options.getString('command');

        if (userCommand) {
            const argCommand = interaction.client.commands.get(userCommand.toLowerCase());

            if (typeof argCommand === 'undefined') {
                interaction.reply('That\'s not one of my commands');
                return;
            }

            let usageStr = `\`${prefix}${argCommand.names[0]}`;

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
            usageStr = `Message:\n${usageStr}\nSlash Command:\n\`/${argCommand.names[0]}\``;

            const aliases = argCommand.names.slice(1);
            let aliasStr = 'There are no aliases for this command';

            if (aliases.length) {
                aliasStr = aliases.join(', ');
            }

            interaction.reply({
                embeds: [{
                    title: `Command: ${argCommand.names[0]}`,
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
                        },
                        {
                            name: 'Cooldown Time',
                            value: `${argCommand.cooldown} second(s)`
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
