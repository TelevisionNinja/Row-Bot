const { invite } = require('../config.json');

module.exports = {
    names: invite.names,
    description: invite.description,
    argsRequired: false,
    argsOptional: false,
    permittedCharsOnly: false,
    guildOnly: false,
    usage: '',
    cooldown: 0,
    execute(msg, args) {
        msg.channel.send(invite.link);
    }
}