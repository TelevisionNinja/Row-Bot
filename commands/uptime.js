import config from '../config.json' assert { type: 'json' };

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
        let uptime = msg.client.uptime;
        const ms = uptime % 1000;
        uptime = ~~(uptime / 1000);
        const s = uptime % 60;
        uptime = ~~(uptime / 60);
        const mins = uptime % 60;
        uptime = ~~(uptime / 60);
        const hrs = uptime % 24;
        uptime = ~~(uptime / 24);
        const days = uptime % 365;

        msg.channel.send(`${days} day(s)\n${hrs} hr(s)\n${mins} min(s)\n${s} s\n${ms} ms`);
    },
    executeInteraction(interaction) {
        let uptime = interaction.client.uptime;
        const ms = uptime % 1000;
        uptime = ~~(uptime / 1000);
        const s = uptime % 60;
        uptime = ~~(uptime / 60);
        const mins = uptime % 60;
        uptime = ~~(uptime / 60);
        const hrs = uptime % 24;
        uptime = ~~(uptime / 24);
        const days = uptime % 365;

        interaction.reply(`${days} day(s)\n${hrs} hr(s)\n${mins} min(s)\n${s} s\n${ms} ms`);
    }
}
