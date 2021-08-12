import { default as config } from '../config.json';

const pingConfig = config.ping;

export default {
    names: pingConfig.names,
    description: pingConfig.description,
    argsRequired: false,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '',
    cooldown: 1,
    async execute(msg, args) {
        const pingMsg = await msg.channel.send('Pinging...');

        pingMsg.edit(`Latency: ${pingMsg.createdTimestamp - msg.createdTimestamp} ms\nAPI Latency: ${msg.client.ws.ping} ms`);
    }
}
