import { default as musicConfig } from './musicConfig.json';
import { default as audioQueue } from '../../lib/audioQueue.js';

const clearConfig = musicConfig.clear;

export default {
    names: clearConfig.names,
    description: clearConfig.description,
    argsRequired: false,
    argsOptional: false,
    vcMemberOnly: true,
    usage: '',
    execute(msg, args) {
        audioQueue.clear(msg.guild.id);
    }
}
