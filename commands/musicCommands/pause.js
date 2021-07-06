import { default as musicConfig } from './musicConfig.json';
import { pause } from '../../lib/audio.js';

const pauseConfig = musicConfig.pause;

export default {
    names: pauseConfig.names,
    description: pauseConfig.description,
    argsRequired: false,
    argsOptional: false,
    guildOnly: false,
    usage: '<url>',
    execute(msg, args) {
        pause(msg);
    }
}
