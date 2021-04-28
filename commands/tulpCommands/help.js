import { default as config } from '../../config.json';
import { sendAuthorDm } from '../../lib/msgUtils.js';
import { readFileSync } from 'fs';

const prefix = config.prefix,
    help = config.help,
    icon = config.icon,
    names = config.names,
    tulp = config.tulp;

const iconFile = {
    attachment: readFileSync(`./${icon}`),
    name: icon
};
let helpCenter = {
    embed: {
        title: `${names[0]}\'s Tulp Help Center`,
        thumbnail: { url: `attachment://${icon}` }
    },
    files: [iconFile]
};
const specific = {
    name: 'Specific Command Info',
    value: `\nSend \`${prefix}${tulp.names[0]} help <command name>\` to get info on a specific command`
};

let notCalled = true;

export default {
    names: help.names,
    description: help.description,
    argsRequired: false,
    argsOptional: true,
    guildOnly: false,
    usage: '<command name>',
    execute(msg, args) {
        // initialize embed 
        if (notCalled) {
            notCalled = false;
            helpCenter.embed.fields = [
                {
                    name: 'My Tulp Commands',
                    value: msg.client.tulpCommands.map(cmd => `• ${cmd.names[0]}`).join('\n')
                },
                specific
            ];
        }

		if (args.length) {
			const userCommand = args[0];
            const argCommand = msg.client.tulpCommands.find(cmd => cmd.names.includes(userCommand));

            if (!argCommand) {
                sendAuthorDm(msg, 'That\'s not one of my tulp commands');
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

            const embed = {
                embed: {
                    title: `Tulp Command: ${argCommand.names[0]}`,
                    description: argCommand.description,
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