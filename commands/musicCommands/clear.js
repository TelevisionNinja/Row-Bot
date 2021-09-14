import { default as musicConfig } from './musicConfig.json';
import { default as audioQueue } from '../../lib/audioQueue.js';
import { Constants } from 'discord.js';

const clearConfig = musicConfig.clear;

export default {
    interactionData: {
        name: clearConfig.names[0],
        description: clearConfig.description,
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        options: []
    },
    names: clearConfig.names,
    description: clearConfig.description,
    argsRequired: false,
    argsOptional: false,
    vcMemberOnly: true,
    usage: '',
    execute(msg, args) {
        audioQueue.clear(msg.guild.id);
    },
    executeInteraction(interaction) {
        audioQueue.clear(interaction.guild.id);
        interaction.reply('Queue cleared');
    }
}
