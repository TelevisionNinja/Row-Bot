import { default as musicConfig } from './musicConfig.json';
import { default as audio } from '../../lib/audio.js';

const skipConfig = musicConfig.skip;

export default {
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
    }
}
