import config from '../../config/config.json' assert { type: 'json' };
import {
    timeFormat,
    byteFormat
} from '../lib/stringUtils.js';

const stats = config.stats;

export default {
    interactionData: {
        name: stats.names[0],
        description: stats.description,
        options: []
    },
    names: stats.names,
    description: stats.description,
    argsRequired: false,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '',
    cooldown: 0,
    async execute(msg, args) {
        const results = await msg.client.shard.broadcastEval(client => {
            return [
                client.shard.ids,
                client.ws.ping,
                client.uptime,
                client.guilds.cache.size,
                client.users.cache.size,
                process.memoryUsage().heapUsed
            ];
        });

        let totalGuilds = 0;
        let totalUsers = 0;
        let totalMemory = 0;

        for (let i = 0, n = results.length; i < n; i++) {
            totalGuilds += results[i][3];
            totalUsers += results[i][4];
            totalMemory += results[i][5];
        }

        let resultStr = `Total Shards: \`${msg.client.shard.count}\` Server Count: \`${totalGuilds}\` User Count: \`${totalUsers}\` Total Memory Used: \`${byteFormat(totalMemory)}\``;

        results.map(data => {
            resultStr = `${resultStr}\nShard IDs: \`[${data[0]}]\` Ping: \`${data[1]}ms\` Uptime: \`${timeFormat(data[2])}\` Guilds: \`${data[3]}\` Memory Used: \`${byteFormat(data[5])}\``;
        });

        msg.reply(resultStr);
    },
    async executeInteraction(interaction) {
        const results = await interaction.client.shard.broadcastEval(client => {
            return [
                client.shard.ids,
                client.ws.ping,
                client.uptime,
                client.guilds.cache.size,
                client.users.cache.size,
                process.memoryUsage().heapUsed
            ];
        });

        let totalGuilds = 0;
        let totalUsers = 0;
        let totalMemory = 0;

        for (let i = 0, n = results.length; i < n; i++) {
            totalGuilds += results[i][3];
            totalUsers += results[i][4];
            totalMemory += results[i][5];
        }

        let resultStr = `Total Shards: \`${interaction.client.shard.count}\` Server Count: \`${totalGuilds}\` User Count: \`${totalUsers}\` Total Memory Used: \`${byteFormat(totalMemory)}\``;

        results.map(data => {
            resultStr = `${resultStr}\nShard IDs: \`[${data[0]}]\` Ping: \`${data[1]}ms\` Uptime: \`${timeFormat(data[2])}\` Guilds: \`${data[3]}\` Memory Used: \`${byteFormat(data[5])}\``;
        });

        interaction.reply(resultStr);
    }
}
