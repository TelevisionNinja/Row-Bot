import config from '../../config/config.json' assert { type: 'json' };

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
                client.users.cache.size
            ];
        });

        let totalGuilds = 0;
        let totalUsers = 0;

        for (let i = 0, n = results.length; i < n; i++) {
            totalGuilds += results[i][3];
            totalUsers += results[i][4];
        }

        let resultStr = `Total Shards: \`${msg.client.shard.count}\` Server Count: \`${totalGuilds}\` User Count: \`${totalUsers}\``;

        results.map(data => {
            resultStr = `${resultStr}\nShard IDs: \`[${data[0]}]\` Ping: \`${data[1]}ms\` Uptime: \`${timeFormat(data[2])}\` Guilds: \`${data[3]}\``;
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
                client.users.cache.size
            ];
        });

        let totalGuilds = 0;
        let totalUsers = 0;

        for (let i = 0, n = results.length; i < n; i++) {
            totalGuilds += results[i][3];
            totalUsers += results[i][4];
        }

        let resultStr = `Total Shards: \`${interaction.client.shard.count}\` Server Count: \`${totalGuilds}\` User Count: \`${totalUsers}\``;

        results.map(data => {
            resultStr = `${resultStr}\nShard IDs: \`[${data[0]}]\` Ping: \`${data[1]}ms\` Uptime: \`${timeFormat(data[2])}\` Guilds: \`${data[3]}\``;
        });

        interaction.reply(resultStr);
    }
}

function numberLengthFormat(n) {
    if (n < 10) {
        return `0${n}`;
    }

    return n;
}

function timeFormat(ms) {
    ms = Math.trunc(ms / 1000);
    const s = ms % 60;
    ms = Math.trunc(ms / 60);
    const min = ms % 60;
    const hr = Math.trunc(ms / 60);

    return `${numberLengthFormat(hr)}:${numberLengthFormat(min)}:${numberLengthFormat(s)}`;
}
