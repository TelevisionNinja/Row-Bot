import { default as musicConfig } from './musicConfig.json';
import { default as audio } from '../../lib/audio.js';

const resumeConfig = musicConfig.resume;

export default {
    names: resumeConfig.names,
    description: resumeConfig.description,
    argsRequired: false,
    argsOptional: false,
    vcMemberOnly: true,
    usage: '',
    execute(msg, args) {
        audio.resume(msg.guild.id);
    }
}
