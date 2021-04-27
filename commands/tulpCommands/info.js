const { info } = require('./tulpConfig.json');
const { tulp: tulpConfig } = require('../../config.json');
const { MessageEmbed } = require('discord.js');
const { tulp: tulpCollection } = require('../../lib/database.js');

module.exports = {
    names: info.names,
    description: info.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: '<name>',
    async execute(msg, args) {
        const username = args.join(' ').trim();
        const query = { _id: msg.author.id };
        const options = {
            projection: {
                tulps: {
                    $elemMatch: {
                        username: username
                    }
                }
            }
        }
        const userData = await tulpCollection.findOne(query, options);

        if (userData === null) {
            msg.channel.send(tulpConfig.notUserMsg);
            return;
        }

        if (typeof userData.tulps === 'undefined') {
            msg.channel.send(tulpConfig.noDataMsg);
            return;
        }

        const selectedTulp = userData.tulps[0];
        const info = new MessageEmbed()
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