import { default as config } from '../../config.json';
import { sendAuthorDm } from '../../lib/msgUtils.js';

const prefix = config.prefix,
    help = config.help,
    icon = config.icon,
    names = config.names,
    music = config.music;

let helpCenter = {
    embed: {
        title: `${names[0]}\'s Music Help Center`,
        thumbnail: { url: icon },
        color: parseInt(help.embedColor, 16)
    }
};
const specific = {
    name: 'Specific Command Info',
    value: `\nSend \`${prefix}${music.names[0]} help <command name>\` to get info on a specific command`
};

// initialize embed
export function initialize(commands) {
    helpCenter.embed.fields = [
        {
            name: 'My Music Commands',
            value: commands.map(cmd => `• ${cmd.names[0]}`).join('\n')
        },
        specific
    ];
}

export default {
    names: help.names,
    description: help.description,
    argsRequired: false,
    argsOptional: true,
    guildOnly: false,
    vcMemberOnly: false,
    usage: '<command name>',
    execute(msg, args) {
		if (args.length) {
			const userCommand = args[0];
            const argCommand = msg.client.musicCommands.find(cmd => cmd.names.includes(userCommand));

            if (typeof argCommand === 'undefined') {
                sendAuthorDm(msg, 'That\'s not one of my music commands');
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

            const embed = {
                embed: {
                    title: `Music Command: ${argCommand.names[0]}`,
                    description: argCommand.description,
                    color: parseInt(help.embedColor, 16),
                    fields: [
                        {
                            name: 'Aliases',
                            value: argCommand.names.slice(1).join(', ')
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
                }
            };

            sendAuthorDm(msg, embed);
        }
        else {
            sendAuthorDm(msg, helpCenter);
        }
    }
}