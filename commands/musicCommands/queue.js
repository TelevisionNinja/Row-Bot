import musicConfig from './musicConfig.json' assert { type: 'json' };
import { default as audioQueue } from '../../lib/audioQueue.js';
import { Constants } from 'discord.js';
import { cutOff } from '../../lib/stringUtils.js';

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
        const queue = audioQueue.get(msg.guild.id);

        if (queue.length) {
            const playing = queue[0];
            let queueStr = `Currently playing:\n${playing}`;

            if (queue.length > 1) {
                let queueList = '\nQueue:';

                for (let i = 1; i < queue.length; i++) {
                    queueList = `${queueList}\n${i}. ${queue[i]}`;
                }

                queueStr = `${queueStr}${queueList}`;
            }

            msg.channel.send(cutOff(queueStr, 2000));
        }
        else {
            msg.channel.send('There are no songs in the queue');
        }
    },
    executeInteraction(interaction) {
        const queue = audioQueue.get(interaction.guild.id);

        if (queue.length) {
            const playing = queue[0];
            let queueStr = `Currently playing:\n${playing}`;

            if (queue.length > 1) {
                let queueList = '\nQueue:';

                for (let i = 1; i < queue.length; i++) {
                    queueList = `${queueList}\n${i}. ${queue[i]}`;
                }

                queueStr = `${queueStr}${queueList}`;
            }

            interaction.reply(cutOff(queueStr, 2000));
        }
        else {
            interaction.reply('There are no songs in the queue');
        }
    }
}
