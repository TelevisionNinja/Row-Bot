import config from '../../config/config.json' with { type: 'json' };
import { ChannelType } from 'discord.js';

const tulp = config.tulp,
    prefix = config.prefix;

export default {
    interactionData: {
        name: tulp.names[0],
        description: tulp.description,
        options: []
    },
    names: tulp.names,
    description: tulp.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '<tulp command>',
    cooldown: 0,
    async execute(msg, args) {
        // get command
        const userCommand = args.shift().toLowerCase();
        const command = msg.client.tulpCommands.get(userCommand);

        //--------------------------------------------------------------------------------

        if (typeof command === 'undefined') {
            return;
        }

        if (command.guildOnly && msg.channel.type === ChannelType.DM) {
            msg.channel.send('I can\'t execute that command in DM\'s');
            return;
        }

        if (command.argsRequired && !args.length) {
            msg.reply(`Please provide arguments\nex: \`${prefix}${tulp.names[0]} ${command.names[0]} ${command.usage}\``);
            return;
        }

        //--------------------------------------------------------------------------------
        // execute command

        try {
            await command.execute(msg, args);
        }
        catch (error) {
            msg.reply('I couldn\'t do that command for some reason 😢');
            console.log(error);
        }
    },
    async executeInteraction(interaction) {
        // get command
        const command = interaction.client.tulpCommands.get(interaction.options.getSubcommand());

        //--------------------------------------------------------------------------------

        if (command.guildOnly && !interaction.inGuild()) {
            interaction.reply('I can\'t execute that command in DM\'s');
            return;
        }

        //--------------------------------------------------------------------------------
        // execute command

        try {
            await command.executeInteraction(interaction);
        }
        catch (error) {
            const content = {
                content: 'I couldn\'t do that command for some reason 😢',
                ephemeral: true
            };

            if (interaction.deferred) {
                interaction.editReply(content);
            }
            else {
                interaction.reply(content);
            }

            console.log(error);
        }
    }
}
