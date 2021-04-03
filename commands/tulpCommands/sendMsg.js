const {
    tulp,
    clientID,
    tagSeparator,
    mongodbURI
} = require('../../config.json');
const { sendMsg } = require('./tulpConfig.json');
const { MongoClient } = require('mongodb');
const Discord = require('discord.js');

module.exports = {
    names: sendMsg.names,
    description: sendMsg.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: `<name>${tagSeparator} <message>`,
    async execute(msg, args) {
        const isDM = msg.channel.type === 'dm';

        if (!isDM) {
            msg.delete();
        }

        // discord trims the initial message, so there's no need to trim it here
        const str = args.join(' ');

        const index = str.indexOf(tagSeparator);

        if (index === -1 || index === str.length - 1) {
            return;
        }

        const tulpName = str.substring(0, index).trim();

        const query = { id: msg.author.id };

        const client = new MongoClient(mongodbURI, { useUnifiedTopology: true });

        let userData;
        let selectedTulp;

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
            client.close();
        }

        if (userData === null) {
            // tell user to use the create command
            msg.author.send(tulp.noDataMsg);
            return;
        }

        // get specific tulp using tulpName
        selectedTulp = userData.tulps.find(t => t.username === tulpName);

        if (typeof selectedTulp === 'undefined') {
            msg.author.send(tulp.noDataMsg);
            return;
        }

        const tulpMsg = str.slice(index + 1).trim();

        //-------------------------------------------------------------------------------------

        if (isDM) {
            const simulatedMsg = new Discord.MessageEmbed()
                .setAuthor(selectedTulp.username, selectedTulp.avatar)
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
                tulpWebhook = await msg.channel.createWebhook(selectedTulp.username, {
                    avatar: selectedTulp.avatar
                });
            }
            catch (error) {
                msg.channel.send('I couldn\'t create a webhook because there\'s too many in here 😢');
                return;
            }
        }
        else {
            if (tulpWebhook.name !== selectedTulp.username || tulpWebhook.avatar !== selectedTulp.avatar) {
                await tulpWebhook.edit({
                    name: selectedTulp.username,
                    avatar: selectedTulp.avatar
                });
            }
        }

        tulpWebhook.send(tulpMsg);
    }
}