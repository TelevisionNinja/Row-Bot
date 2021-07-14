import { default as musicConfig } from './musicConfig.json';
import { skip } from '../../lib/audio.js';

const skipConfig = musicConfig.skip;

export default {
    names: skipConfig.names,
    description: skipConfig.description,
    argsRequired: false,
    argsOptional: false,
    vcMemberOnly: true,
    usage: '',
    execute(msg, args) {
        skip(msg);
    }
}
