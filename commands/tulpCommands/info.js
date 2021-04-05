const { info } = require('./tulpConfig.json');
const { MongoClient } = require('mongodb');
const {
    mongodbURI,
    tulp
} = require('../../config.json');
const Discord = require('discord.js');

module.exports = {
    names: info.names,
    description: info.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: '<name>',
    async execute(msg, args) {
        const query = { _id: msg.author.id };
        const client = new MongoClient(mongodbURI, { useUnifiedTopology: true });

        let userData;

        try {
            await client.connect();

            const database = client.db('tulps');
            const collection = database.collection('users');

            userData = await collection.findOne(query);
        }
        catch (error) {
            console.log(error);
            return;
        }
        finally {
            await client.close();
        }

        if (userData === null) {
            msg.author.send(tulp.notUserMsg);
            return;
        }

        const tulpName = args[0].trim();
        const selectedTulp = userData.tulps.find(t => t.username === tulpName);

        if (typeof selectedTulp === 'undefined') {
            msg.channel.send(tulp.noDataMsg);
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