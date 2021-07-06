import { default as musicConfig } from './musicConfig.json';
import { resume } from '../../lib/audio.js';

const resumeConfig = musicConfig.resume;

export default {
    names: resumeConfig.names,
    description: resumeConfig.description,
    argsRequired: false,
    argsOptional: false,
    guildOnly: false,
    vcMemberOnly: true,
    usage: '',
    execute(msg, args) {
        resume(msg);
    }
}
