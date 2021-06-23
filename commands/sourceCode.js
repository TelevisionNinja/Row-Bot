import { default as config } from '../config.json';

const sourceCodeConfig = config.sourceCode;

export default {
    names: sourceCodeConfig.names,
    description: sourceCodeConfig.description,
    argsRequired: false,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '',
    cooldown: 0,
    execute(msg, args) {
        msg.channel.send(sourceCodeConfig.link);
    }
}