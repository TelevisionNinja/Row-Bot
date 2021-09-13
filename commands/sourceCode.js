import { default as config } from '../config.json';

const sourceCodeConfig = config.sourceCode;

export default {
    interactionData: {
        name: sourceCodeConfig.names[0],
        description: sourceCodeConfig.description,
        options: []
    },
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
    },
    executeInteraction(interaction) {
        interaction.reply(sourceCodeConfig.link);
    }
}
