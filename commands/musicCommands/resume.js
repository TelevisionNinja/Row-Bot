import musicConfig from './musicConfig.json' assert { type: 'json' };
import { default as audioPlayer } from '../../lib/audioPlayer.js';
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
        audioPlayer.resume(msg);
    },
    executeInteraction(interaction) {
        audioPlayer.resume(interaction);
    }
}
