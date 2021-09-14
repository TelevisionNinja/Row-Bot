import { default as musicConfig } from './musicConfig.json';
import { default as audio } from '../../lib/audio.js';
import { Constants } from 'discord.js';

const pauseConfig = musicConfig.pause;

export default {
    interactionData: {
        name: pauseConfig.names[0],
        description: pauseConfig.description,
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        options: []
    },
    names: pauseConfig.names,
    description: pauseConfig.description,
    argsRequired: false,
    argsOptional: false,
    vcMemberOnly: true,
    usage: '',
    execute(msg, args) {
        audio.pause(msg.guild.id);
    },
    executeInteraction(interaction) {
        audio.pause(interaction.guild.id);
        interaction.reply('Song paused');
    }
}
