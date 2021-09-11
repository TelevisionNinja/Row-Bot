import { default as musicConfig } from './musicConfig.json';
import { default as audioQueue } from '../../lib/audioQueue.js';

const queueConfig = musicConfig.queue;

export default {
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

            msg.channel.send(queueStr);
        }
        else {
            msg.channel.send('There are no songs in the queue');
        }
    }
}
