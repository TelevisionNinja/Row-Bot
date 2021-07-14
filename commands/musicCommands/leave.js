import { default as musicConfig } from './musicConfig.json';
import { leave } from '../../lib/audio.js';

const leaveConfig = musicConfig.leave;

export default {
    names: leaveConfig.names,
    description: leaveConfig.description,
    argsRequired: false,
    argsOptional: false,
    vcMemberOnly: true,
    usage: '',
    execute(msg, args) {
        leave(msg.guild.id);
    }
}
