const {
    tulp,
    clientID
} = require('../../config.json');
const { sendMsg } = require('./tulpConfig.json');
const { MongoClient } = require('mongodb');
const { mongodbURI } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {
    names: sendMsg.names,
    description: sendMsg.description,
    args: true,
    guildOnly: false,
    usage: '<name>, <message>',
    async execute(msg, args) {
        const isDM = msg.channel.type === 'dm';
        if (!isDM) {
            msg.delete();
        }

        // discord trims the initial message, so there's no need to trim it here
        const str = args.join(' ');

        const index = str.indexOf(',');

        if (index === -1 || index === str.length - 1) {
            return;
        }

        const tulpName = str.substring(0, index).trim();

        const query = { id: msg.author.id };

        const client = new MongoClient(mongodbURI, { useUnifiedTopology: true });

        let authorTulp;

        try {
            await client.connect();

            const database = client.db('tulps');
            const collection = database.collection("users");

            const userData = await collection.findOne(query);

            if (userData === null) {
                // tell user to use the create command
                msg.author.send(tulp.noDataMsg);
                return;
            }

            // get specific tulp using tulpName
            authorTulp = userData.tulps.find(t => t.username === tulpName);

            if (typeof authorTulp === 'undefined') {
                msg.author.send(tulp.noDataMsg);
                return;
            }
        }
        catch (error) {
            console.log(error);
            return;
        }
        finally {
            client.close();
        }

        const tulpMsg = str.slice(index + 1).trim();

        //-------------------------------------------------------------------------------------

        if (isDM) {
            const simulatedMsg = new Discord.MessageEmbed()
                .setAuthor(authorTulp.username, authorTulp.avatar)
                .setDescription(tulpMsg);

            msg.channel.send(simulatedMsg);
            return;
        }

        //-------------------------------------------------------------------------------------

        const channelWebhooks = await msg.channel.fetchWebhooks();
        let tulpWebhook = undefined;

        for (const webhook of channelWebhooks.values()) {
            if (webhook.owner.id === clientID) {
                tulpWebhook = webhook;
                break;
            }
        }

        if (typeof tulpWebhook === 'undefined') {
            try {
                tulpWebhook = await msg.channel.createWebhook(authorTulp.username, {
                    avatar: authorTulp.avatar
                });
            }
            catch (error) {
                msg.channel.send('I couldn\'t create a webhook because there\'s too many in here 😢');
                return;
            }
        }
        else {
            if (tulpWebhook.name !== authorTulp.username || tulpWebhook.avatar !== authorTulp.avatar) {
                await tulpWebhook.edit({
                    name: authorTulp.username,
                    avatar: authorTulp.avatar
                });
            }
        }

        tulpWebhook.send(tulpMsg);
    }
}