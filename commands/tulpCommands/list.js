const { list: listConfig } = require('./tulpConfig.json');
const Discord = require('discord.js');
const { tulp: tulpCollection } = require('../../lib/database.js');

module.exports = {
    names: listConfig.names,
    description: listConfig.description,
    argsRequired: false,
    argsOptional: false,
    guildOnly: false,
    usage: '',
    async execute(msg, args) {
        const query = { _id: msg.author.id };
        const userData = await tulpCollection.findOne(query);

        if (userData === null) {
            msg.channel.send(listConfig.noTulpsMsg);
            return;
        }

        const tulpArr = userData.tulps.map(t => `• ${t.username}`);
        const tulpList = new Discord.MessageEmbed()
            .setTitle('Your tulps')
            .setDescription(tulpArr);

        msg.channel.send(tulpList);
    }
}