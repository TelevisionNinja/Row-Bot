import { default as config } from '../config.json';

const invite = config.invite;

export default {
    names: invite.names,
    description: invite.description,
    argsRequired: false,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '',
    cooldown: 0,
    execute(msg, args) {
        msg.channel.send(invite.link);
    }
}