import config from '../../config/config.json' assert { type: 'json' };

const pingConfig = config.ping;

export default {
    interactionData: {
        name: pingConfig.names[0],
        description: pingConfig.description,
        options: []
    },
    names: pingConfig.names,
    description: pingConfig.description,
    argsRequired: false,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '',
    cooldown: 1,
    async execute(msg, args) {
        const pingMsg = await msg.reply('Pinging...');

        pingMsg.edit(`Roundtrip latency: ${pingMsg.createdTimestamp - msg.createdTimestamp} ms\nWebsocket heartbeat: ${msg.client.ws.ping} ms`);
    },
    async executeInteraction(interaction) {
        const pingMsg = await interaction.reply({
            content: 'Pinging...',
            fetchReply: true
        });

        interaction.editReply(`Roundtrip latency: ${pingMsg.createdTimestamp - interaction.createdTimestamp} ms\nWebsocket heartbeat: ${interaction.client.ws.ping} ms`);
    }
}
