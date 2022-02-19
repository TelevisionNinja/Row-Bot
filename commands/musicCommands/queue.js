import musicConfig from './musicConfig.json' assert { type: 'json' };
import { default as audioPlayer } from '../../lib/audioPlayer.js';
import { Constants } from 'discord.js';

const queueConfig = musicConfig.queue;

export default {
    interactionData: {
        name: queueConfig.names[0],
        description: queueConfig.description,
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        options: []
    },
    names: queueConfig.names,
    description: queueConfig.description,
    argsRequired: false,
    argsOptional: false,
    vcMemberOnly: true,
    usage: '',
    execute(msg, args) {
        audioPlayer.getQueue(msg);
    },
    executeInteraction(interaction) {
        audioPlayer.getQueue(interaction);
    }
}
