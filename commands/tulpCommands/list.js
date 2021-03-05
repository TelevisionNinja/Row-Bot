const { list: listConfig } = require('./tulpConfig.json');
const { MongoClient } = require('mongodb');
const { mongodbURI } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {
    names: listConfig.names,
    description: listConfig.description,
    argsRequired: false,
    argsOptional: false,
    guildOnly: false,
    usage: '',
    async execute(msg, args) {
        const query = { id: msg.author.id };

        const client = new MongoClient(mongodbURI, { useUnifiedTopology: true });

        let userData;

        try {
            await client.connect();

            const database = client.db('tulps');
            const collection = database.collection("users");

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
            msg.author.send(listConfig.noTulpsMsg);
            return;
        }

        const tulpArr = userData.tulps.map(t => `• ${t.username}`);

        const list = new Discord.MessageEmbed()
            .setTitle('Your tulps')
            .setDescription(tulpArr);

        msg.channel.send(list);
    }
}