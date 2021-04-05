const { info } = require('./tulpConfig.json');
const { tulp: tulpConfig } = require('../../config.json');
const Discord = require('discord.js');
const { tulp: tulpCollection } = require('../../lib/database.js');

module.exports = {
    names: info.names,
    description: info.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: '<name>',
    async execute(msg, args) {
        const query = { _id: msg.author.id };
        const userData = await tulpCollection.findOne(query);

        if (userData === null) {
            msg.channel.send(tulpConfig.notUserMsg);
            return;
        }

        const tulpName = args[0].trim();
        const selectedTulp = userData.tulps.find(t => t.username === tulpName);

        if (typeof selectedTulp === 'undefined') {
            msg.channel.send(tulpConfig.noDataMsg);
            return;
        }

        const info = new Discord.MessageEmbed()
            .setThumbnail(selectedTulp.avatar)
            .setTitle(selectedTulp.username)
            .addFields(
                {
                    name: 'Brackets',
                    value: `${selectedTulp.startBracket}text${selectedTulp.endBracket}`
                }
            );

        msg.channel.send(info);
    }
}