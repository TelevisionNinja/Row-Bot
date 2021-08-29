import { default as config } from '../config.json';

const uptime = config.uptime;

export default {
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
    }
}