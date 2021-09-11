import { default as musicConfig } from './musicConfig.json';
import { default as audio } from '../../lib/audio.js';

const pauseConfig = musicConfig.pause;

export default {
    names: pauseConfig.names,
    description: pauseConfig.description,
    argsRequired: false,
    argsOptional: false,
    vcMemberOnly: true,
    usage: '',
    execute(msg, args) {
        audio.pause(msg.guild.id);
    }
}
