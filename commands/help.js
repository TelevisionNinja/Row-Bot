const {
    prefix,
    help,
    icon
} = require('../config.json');
const Discord = require('discord.js');

const helpCenter = new Discord.MessageEmbed()
    .setTitle('Pinkie\'s Help Center')
    .attachFiles(`./${icon}`)
    .setThumbnail(`attachment://${icon}`);
const specific = {
    name: 'Specific Command Info',
    value: `\nSend \`${prefix}help <command name>\` to get info on a specific command`
};

let called = false;

module.exports = {
    names: help.names,
    fileName: __filename,
    description: help.description,
    args: false,
    guildOnly: false,
    usage: '<command name>',
    cooldown: 0,
    loadCommands,
    async execute(msg, args) {
		if (args.length) {
			const userCommand = args[0];
            const argCommand = msg.client.commands.find(cmd => cmd.names.includes(userCommand));

            if (!argCommand) {
                sendDm(msg, 'That\'s not one of my commands');
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
                    },
                    {
                        name: 'Cooldown Time',
                        value: `${argCommand.cooldown} second(s)`
                    }
                );

            sendDm(msg, embed);
        }
        else {
            sendDm(msg, helpCenter);
        }
    }
}

/**
 * Sends a message to the author's DM's.
 * Splits the message into multiple messages if it exceeds the discord char limit.
 * 
 * @param {*} msg Discord.Message
 * @param {*} data message to be sent through DM's
 */
async function sendDm(msg, data) {
    try {
        await msg.author.send(data);

        if (msg.channel.type === 'dm') {
            return;
        }
        
        msg.reply('I\'ve sent you a DM');
    }
    catch (error) {
        console.log(error);
        msg.reply('I couldn\'t DM you 😢');
    }
}

/**
 * This function is not meant to be used by the user.
 * It has protection against multiple uses just incase it is.
 * 
 * @param {*} commands 
 */
function loadCommands(commands) {
    if (called) {
        helpCenter.spliceFields(0, 25);
    }
    else {
        called = true;
    }
    
    helpCenter.addFields(
        {
            name: 'My Commands',
            value: commands.map(cmd => `• ${cmd.names[0]}`).join('\n')
        },
        specific
    );
}