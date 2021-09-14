import { default as musicConfig } from './musicConfig.json';
import { default as audio } from '../../lib/audio.js';
import { Constants } from 'discord.js';

const resumeConfig = musicConfig.resume;

export default {
    interactionData: {
        name: resumeConfig.names[0],
        description: resumeConfig.description,
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        options: []
    },
    names: resumeConfig.names,
    description: resumeConfig.description,
    argsRequired: false,
    argsOptional: false,
    vcMemberOnly: true,
    usage: '',
    execute(msg, args) {
        audio.resume(msg.guild.id);
    },
    executeInteraction(interaction) {
        audio.resume(interaction.guild.id);
        interaction.reply('Song resumed');
    }
}
