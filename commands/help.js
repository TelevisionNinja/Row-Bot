import { default as config } from '../config.json';
import { sendAuthorDm } from '../lib/msgUtils.js';

const prefix = config.prefix,
    help = config.help,
    icon = config.icon,
    names = config.names;

let helpCenter = {
    embed: {
        title: `${names[0]}\'s Help Center`,
        thumbnail: { url: icon }
    }
};
const specific = {
    name: 'Specific Command Info',
    value: `\nSend \`${prefix}help <command name>\` to get info on a specific command`
};

let notCalled = true;

export default {
    names: help.names,
    description: help.description,
    argsRequired: false,
    argsOptional: true,
    permittedCharsOnly: false,
    guildOnly: false,
    usage: '<command name>',
    cooldown: 0,
    execute(msg, args) {
        // initialize embed
        if (notCalled) {
            notCalled = false;
            helpCenter.embed.fields = [
                {
                    name: 'My Commands',
                    value: msg.channel.client.commands.map(cmd => `• ${cmd.names[0]}`).join('\n')
                },
                specific
            ];
        }

		if (args.length) {
			const userCommand = args[0];
            const argCommand = msg.channel.client.commands.find(cmd => cmd.names.includes(userCommand));

            if (typeof argCommand === 'undefined') {
                sendAuthorDm(msg, 'That\'s not one of my commands');
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

            const embed = {
                embed: {
                    title: `Command: ${argCommand.names[0]}`,
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
                        },
                        {
                            name: 'Cooldown Time',
                            value: `${argCommand.cooldown} second(s)`
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