import { default as musicConfig } from './musicConfig.json';
import { default as audio } from '../../lib/audio.js';
import { ApplicationCommandOptionTypes } from '../../lib/enums.js';

const skipConfig = musicConfig.skip;

export default {
    interactionData: {
        name: skipConfig.names[0],
        description: skipConfig.description,
        type: ApplicationCommandOptionTypes.SUB_COMMAND,
        options: [
            {
                name: 'index',
                description: 'The index of the song to skip',
                required: false,
                type: ApplicationCommandOptionTypes.STRING
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
        const index = interaction.options.get('index');

        if (index) {
            audio.skip(interaction, index.value);
        }
        else {
            audio.skip(interaction);
        }

        interaction.reply('Song skipped');
    }
}
