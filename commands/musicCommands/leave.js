import { default as musicConfig } from './musicConfig.json';

const leaveConfig = musicConfig.leave;

export default {
    names: leaveConfig.names,
    description: leaveConfig.description,
    argsRequired: false,
    argsOptional: false,
    guildOnly: false,
    vcMemberOnly: true,
    usage: '',
    execute(msg, args) {
        msg.member.voice.channel.leave();
    }
}
