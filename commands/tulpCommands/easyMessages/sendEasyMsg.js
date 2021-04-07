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
        const tulpArr = userData.tulps;
        let selectedTulp = {
            startBracket: '',
            endBracket: ''
        };
        let hasTulp = false;

        for (let i = 0, n = tulpArr.length; i < n; i++) {
            const currentTulp = tulpArr[i];

            if (userMessage.startsWith(currentTulp.startBracket) &&
                userMessage.endsWith(currentTulp.endBracket) &&
                currentTulp.startBracket.length >= selectedTulp.startBracket.length &&
                currentTulp.endBracket.length >= selectedTulp.endBracket.length) {
                selectedTulp = currentTulp;
                hasTulp = true;
            }
        }

        if (!hasTulp) {
            return false;
        }

        const tulpMsg = userMessage.substring(selectedTulp.startBracket.length, userMessage.length - selectedTulp.endBracket.length).trim();

        if (!tulpMsg.length) {
            return false;
        }

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

        //-------------------------------------------------------------------------------------
        // webhook

        const channelWebhooks = await msg.channel.fetchWebhooks();
        const webhookArr = channelWebhooks.values();
        let tulpWebhook = undefined;

        for (let i = 0, n = webhookArr.length; i < n; i++) {
            const webhook = webhookArr[i];

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