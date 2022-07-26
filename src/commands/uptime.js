import config from '../../config/config.json' assert { type: 'json' };

const uptime = config.uptime;

export default {
    interactionData: {
        name: uptime.names[0],
        description: uptime.description,
        options: []
    },
    names: uptime.names,
    description: uptime.description,
    argsRequired: false,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '',
    cooldown: 0,
    execute(msg, args) {
        let uptime = Math.trunc(msg.client.uptime / 1000);
        const s = uptime % 60;
        uptime = Math.trunc(uptime / 60);
        const mins = uptime % 60;
        uptime = Math.trunc(uptime / 60);
        const hrs = uptime % 24;
        uptime = Math.trunc(uptime / 24);
        const days = uptime % 365;

        msg.reply(`${days} days\n${hrs} hours\n${mins} minutes\n${s} seconds`);
    },
    executeInteraction(interaction) {
        let uptime = Math.trunc(interaction.client.uptime / 1000);
        const s = uptime % 60;
        uptime = Math.trunc(uptime / 60);
        const mins = uptime % 60;
        uptime = Math.trunc(uptime / 60);
        const hrs = uptime % 24;
        uptime = Math.trunc(uptime / 24);
        const days = uptime % 365;

        interaction.reply(`${days} days\n${hrs} hours\n${mins} minutes\n${s} seconds`);
    }
}
