import { default as config } from '../config.json';
import { default as audio } from '../lib/audio.js';

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

        if (command.vcMemberOnly && !audio.vcCheck(msg)) {
            return;
        }

        if (command.argsRequired && !args.length) {
            msg.channel.send(`Please provide arguments\nex: \`${prefix}${music.names[0]} ${command.names[0]} ${command.usage}\``);
            return;
        }

        //--------------------------------------------------------------------------------
        // execute command

        try {
            await command.execute(msg, args);
        }
        catch (error) {
            msg.channel.send('I couldn\'t do that command for some reason 😢');
            console.log(error);
        }
    },
    async executeInteraction(interaction) {
        // get command
        const command = interaction.client.musicCommands.get(interaction.options._subcommand);

        //--------------------------------------------------------------------------------

        if (typeof command === 'undefined') {
            return;
        }

        if (command.vcMemberOnly && !audio.vcCheckInteraction(interaction)) {
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
