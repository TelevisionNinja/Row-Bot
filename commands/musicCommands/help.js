import { default as config } from '../../config.json';

const prefix = config.prefix,
    help = config.help,
    icon = config.icon,
    names = config.names,
    music = config.music;

let helpCenter = {
    embeds: [{
        title: `${names[0]}\'s Music Help Center`,
        thumbnail: { url: icon },
        color: parseInt(help.embedColor, 16)
    }]
};
const specific = {
    name: 'Specific Command Info',
    value: `\nSend \`${prefix}${music.names[0]} help <command name>\` to get info on a specific command`
};

// initialize embed
export function initialize(commands) {
    helpCenter.embeds[0].fields = [
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
    vcMemberOnly: false,
    usage: '<command name>',
    execute(msg, args) {
		if (args.length) {
			const userCommand = args[0];
            const argCommand = msg.client.musicCommands.find(cmd => cmd.names.includes(userCommand));

            if (typeof argCommand === 'undefined') {
                msg.channel.send('That\'s not one of my music commands');
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

            const aliases = argCommand.names.slice(1);
            let aliasStr = 'There are no aliases for this command';

            if (aliases.length) {
                aliasStr = aliases.join(', ');
            }

            const embeds = {
                embeds: [{
                    title: `Music Command: ${argCommand.names[0]}`,
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
                            name: 'Voice Channel Only Command?',
                            value: argCommand.vcMemberOnly ? 'Can only be used in voice channels' : 'Can be used without voice channels'
                        }
                    ]
                }]
            };

            msg.channel.send(embeds);
        }
        else {
            msg.channel.send(helpCenter);
        }
    }
}