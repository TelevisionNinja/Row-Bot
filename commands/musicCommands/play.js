import { default as musicConfig } from './musicConfig.json';
import { playYoutube } from '../../lib/audio.js';

const play = musicConfig.play;

export default {
    names: play.names,
    description: play.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: '<url>',
    async execute(msg, args) {
        if (!(msg.guild.voice && msg.guild.voice.connection)) {
            await msg.member.voice.channel.join();
        }

        const connection = msg.guild.voice.connection;
        playYoutube(msg, connection, args[0]);
    }
}
