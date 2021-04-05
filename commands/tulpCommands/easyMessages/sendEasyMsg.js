const { clientID } = require('../../../config.json');
const Discord = require('discord.js');
const { tulp: tulpCollection } = require('../../../lib/database.js');

module.exports = {
    usage: `<custom bracket><message><custom bracket>`,
    async sendEasyMsg(msg) {
        const query = { _id: msg.author.id };
        const userData = await tulpCollection.findOne(query);

        if (userData === null) {
            return false;
        }

        // get specific tulp
        const userMessage = msg.content;
        const selectedTulp = userData.tulps.find(t => userMessage.startsWith(t.startBracket) && userMessage.endsWith(t.endBracket));

        if (typeof selectedTulp === 'undefined') {
            return false;
        }

        const tulpMsg = userMessage.substring(selectedTulp.startBracket.length, userMessage.length - selectedTulp.endBracket.length).trim();

        //-------------------------------------------------------------------------------------
        // detect dm channel

        if (msg.channel.type === 'dm') {
            const simulatedMsg = new Discord.MessageEmbed()
                .setAuthor(selectedTulp.username, selectedTulp.avatar)
                .setDescription(tulpMsg);

            msg.channel.send(simulatedMsg);
            return true;
        }
        
        msg.delete();

        if (!tulpMsg.length) {
            return false;
        }

        //-------------------------------------------------------------------------------------
        // webhook

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
                return false;
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

        return true;
    }
}