const { list } = require('./tulpConfig.json');
const { MongoClient } = require('mongodb');
const { mongodbURI } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {
    names: list.names,
    description: list.description,
    args: false,
    guildOnly: false,
    usage: '',
    async execute(msg, args) {
        const query = { id: msg.author.id };

        const client = new MongoClient(mongodbURI, { useUnifiedTopology: true });

        try {
            await client.connect();

            const database = client.db('tulps');
            const collection = database.collection("users");

            const userData = await collection.findOne(query);

            if (userData === null) {
                // tell user to use the create command
                msg.author.send(tulp.noDataWarning);
                return;
            }

            const tulpArr = userData.tulps.map(t => `• ${t.username}`);

            const list = new Discord.MessageEmbed()
                .setTitle('Your tulps')
                .setDescription(tulpArr);

            msg.channel.send(list);
        }
        catch (error) {
            console.log(error);
        }
        finally {
            await client.close();
        }
    }
}