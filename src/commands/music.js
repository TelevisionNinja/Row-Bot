import config from '../../config/config.json' assert { type: 'json' };
import { default as audioUtils } from '../lib/audioUtils.js';

const music = config.music,
    prefix = config.prefix;

export default {
    interactionData: {
        name: music.names[0],
        description: music.description,
        options: []
    },
    names: music.names,
    description: music.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: true,
    usage: '<music command>',
    cooldown: 0,
    async execute(msg, args) {
        // get command
        const userCommand = args.shift().toLowerCase();
        const command = msg.client.musicCommands.get(userCommand);

        //--------------------------------------------------------------------------------

        if (typeof command === 'undefined') {
            return;
        }

        if (command.vcMemberOnly && !audioUtils.vcCheck(msg)) {
            return;
        }

        if (command.argsRequired && !args.length) {
            msg.reply(`Please provide arguments\nex: \`${prefix}${music.names[0]} ${command.names[0]} ${command.usage}\``);
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
        const command = interaction.client.musicCommands.get(interaction.options.getSubcommand());

        //--------------------------------------------------------------------------------

        if (command.vcMemberOnly && !audioUtils.vcCheck(interaction)) {
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
