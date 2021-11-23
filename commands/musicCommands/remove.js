import musicConfig from './musicConfig.json' assert { type: 'json' };
import { default as audio } from '../../lib/audio.js';
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
            msg.channel.send('Please provide a number');
        }
        else {
            audio.remove(msg, index);
        }
    },
    executeInteraction(interaction) {
        const index = interaction.options.getInteger('index');

        audio.removeInteraction(interaction, index);
    }
}
