import musicConfig from '../../../config/musicConfig.json' with { type: 'json' };
import { default as audioPlayer } from '../../lib/audioPlayer.js';
import { ApplicationCommandOptionType } from 'discord.js';

const clearConfig = musicConfig.clear;

export default {
    interactionData: {
        name: clearConfig.names[0],
        description: clearConfig.description,
        type: ApplicationCommandOptionType.Subcommand,
        options: []
    },
    names: clearConfig.names,
    description: clearConfig.description,
    argsRequired: false,
    argsOptional: false,
    vcMemberOnly: true,
    usage: '',
    execute(msg, args) {
        audioPlayer.clearQueue(msg);
    },
    executeInteraction(interaction) {
        audioPlayer.clearQueue(interaction);
    }
}
