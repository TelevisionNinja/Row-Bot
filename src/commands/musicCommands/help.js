import config from '../../../config/config.json' with { type: 'json' };
import { ApplicationCommandOptionType } from 'discord.js';

const prefix = config.prefix,
    help = config.help,
    icon = config.icon,
    names = config.names,
    music = config.music,
    color = parseInt(help.embedColor, 16);

let helpCenter = {
    embeds: [{
        title: `${names[0]}\'s Music Help Center`,
        thumbnail: { url: icon },
        color: color
    }]
};

// initialize embed
export function initialize(commands) {
    helpCenter.embeds[0].fields = [
        {
            name: 'My Music Commands',
            value: commands.map(cmd => `• ${cmd.names[0]}`).join('\n')
        },
        {
            name: 'Specific Command Info',
            value: `Send \`${prefix}${music.names[0]} help <command name>\` or \`/${music.names[0]} help <command name>\` to get info on a specific command`
        }
    ];
}

export default {
    interactionData: {
        name: help.names[0],
        description: help.description,
        type: ApplicationCommandOptionType.Subcommand,
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
    vcMemberOnly: false,
    usage: '<command name>',
    execute(msg, args) {
        if (args.length) {
            const userCommand = args[0].toLowerCase();
            const argCommand = msg.client.musicCommands.get(userCommand);

            if (typeof argCommand === 'undefined') {
                msg.reply('That\'s not one of my music commands');
                return;
            }

            let usageStr = `\`${prefix}${music.names[0]} ${argCommand.names[0]}`;

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
            usageStr = `Message:\n${usageStr}\nSlash Command:\n\`/${music.names[0]} ${argCommand.names[0]}\``;

            const aliases = argCommand.names.slice(1);
            let aliasStr = 'There are no aliases for this command';

            if (aliases.length) {
                aliasStr = aliases.join(', ');
            }

            msg.reply({
                embeds: [{
                    title: `Music Command: ${argCommand.names[0]}`,
                    description: argCommand.description,
                    color: color,
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
                            name: 'Voice Channel Only Command?',
                            value: argCommand.vcMemberOnly ? 'Can only be used in voice channels' : 'Can be used without voice channels'
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
            const argCommand = interaction.client.musicCommands.get(userCommand.toLowerCase());

            if (typeof argCommand === 'undefined') {
                interaction.reply('That\'s not one of my music commands');
                return;
            }

            let usageStr = `\`${prefix}${music.names[0]} ${argCommand.names[0]}`;

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
            usageStr = `Message:\n${usageStr}\nSlash Command:\n\`/${music.names[0]} ${argCommand.names[0]}\``;

            const aliases = argCommand.names.slice(1);
            let aliasStr = 'There are no aliases for this command';

            if (aliases.length) {
                aliasStr = aliases.join(', ');
            }

            interaction.reply({
                embeds: [{
                    title: `Music Command: ${argCommand.names[0]}`,
                    description: argCommand.description,
                    color: color,
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
                            name: 'Voice Channel Only Command?',
                            value: argCommand.vcMemberOnly ? 'Can only be used in voice channels' : 'Can be used without voice channels'
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
