import musicConfig from './musicConfig.json' assert { type: 'json' };
import { default as audio } from '../../lib/audio.js';
import { Constants } from 'discord.js';

const skipConfig = musicConfig.skip;

export default {
    interactionData: {
        name: skipConfig.names[0],
        description: skipConfig.description,
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        options: [
            {
                name: 'index',
                description: 'The index of the song to skip to',
                required: false,
                type: Constants.ApplicationCommandOptionTypes.INTEGER
            }
        ]
    },
    names: skipConfig.names,
    description: skipConfig.description,
    argsRequired: false,
    argsOptional: true,
    vcMemberOnly: true,
    usage: '<index>',
    execute(msg, args) {
        if (args.length) {
            const index = parseInt(args[0]);

            if (isNaN(index)) {
                msg.channel.send('Please provide a number');
                return;
            }

            audio.skip(msg, index);
        }
        else {
            audio.skip(msg);
        }
    },
    executeInteraction(interaction) {
        const index = interaction.options.getInteger('index');

        audio.skipInteraction(interaction, index);
    }
}
