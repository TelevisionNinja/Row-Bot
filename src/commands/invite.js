import config from '../../config/config.json' assert { type: 'json' };

const invite = config.invite;

export default {
    interactionData: {
        name: invite.names[0],
        description: invite.description,
        options: []
    },
    names: invite.names,
    description: invite.description,
    argsRequired: false,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '',
    cooldown: 0,
    execute(msg, args) {
        msg.reply(invite.link);
    },
    executeInteraction(interaction) {
        interaction.reply(invite.link);
    }
}
