import musicConfig from '../../../config/musicConfig.json' assert { type: 'json' };
import { default as audioPlayer } from '../../lib/audioPlayer.js';
import { Constants } from 'discord.js';

const removeConfig = musicConfig.remove;

export default {
    interactionData: {
        name: removeConfig.names[0],
        description: removeConfig.description,
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        options: [
            {
                name: 'index',
                description: 'The index of the song to remove',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.INTEGER
            }
        ]
    },
    names: removeConfig.names,
    description: removeConfig.description,
    argsRequired: true,
    argsOptional: false,
    vcMemberOnly: true,
    usage: '<index>',
    execute(msg, args) {
        const index = parseInt(args[0]);

        if (isNaN(index)) {
            msg.reply('Please provide a number');
        }
        else {
            audioPlayer.removeSong(msg, index);
        }
    },
    executeInteraction(interaction) {
        const index = interaction.options.getInteger('index');

        audioPlayer.removeSong(interaction, index);
    }
}
