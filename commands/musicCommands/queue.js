import { default as musicConfig } from './musicConfig.json';
import { get } from '../../lib/audioQueue.js';

const queueConfig = musicConfig.queue;

export default {
    names: queueConfig.names,
    description: queueConfig.description,
    argsRequired: false,
    argsOptional: false,
    guildOnly: false,
    vcMemberOnly: true,
    usage: '',
    execute(msg, args) {
        const queue = get(msg.guild.id);
        const playing = queue.shift();
        let queueStr = `Currently playing:\n${playing}`;

        if (queue.length) {
            queueStr = `${queueStr}\nQueue:\n${queue.map((str, index) => `${index + 1} ${str}`).join('\n')}`;
        }

        msg.channel.send(queueStr);
    }
}
