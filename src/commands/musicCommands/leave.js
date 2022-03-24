import musicConfig from '../../../config/musicConfig.json' assert { type: 'json' };
import { default as audioPlayer } from '../../lib/audioPlayer.js';
import { Constants } from 'discord.js';

const leaveConfig = musicConfig.leave;

export default {
    interactionData: {
        name: leaveConfig.names[0],
        description: leaveConfig.description,
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        options: []
    },
    names: leaveConfig.names,
    description: leaveConfig.description,
    argsRequired: false,
    argsOptional: false,
    vcMemberOnly: true,
    usage: '',
    execute(msg, args) {
        audioPlayer.leaveVC(msg);
    },
    executeInteraction(interaction) {
        audioPlayer.leaveVC(interaction);
    }
}