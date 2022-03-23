import musicConfig from '../../../config/musicConfig.json' assert { type: 'json' };
import { default as audioPlayer } from '../../lib/audioPlayer.js';
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
        audioPlayer.pause(msg);
    },
    executeInteraction(interaction) {
        audioPlayer.pause(interaction);
    }
}
