const Discord = require('discord.js');
const { tulp: tulpCollection } = require('../../../lib/database.js');
const msgUtils = require('../../../lib/msgUtils.js');

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

            if (currentTulp.startBracket.length >= selectedTulp.startBracket.length &&
                currentTulp.endBracket.length >= selectedTulp.endBracket.length &&
                userMessage.startsWith(currentTulp.startBracket) &&
                userMessage.endsWith(currentTulp.endBracket)) {
                selectedTulp = currentTulp;
                hasTulp = true;
            }
        }

        if (!hasTulp) {
            return false;
        }

        let tulpMsg = userMessage.substring(selectedTulp.startBracket.length, userMessage.length - selectedTulp.endBracket.length).trim();

        if (!tulpMsg.length) {
            return false;
        }

        //-------------------------------------------------------------------------------------
        // referenced msg

        const reference = msg.referencedMessage;

        if (typeof reference !== 'undefined') {
            // put the referenced msg in a quote
            const referenceMsg = reference.content.replaceAll('\n', '\n> ');
            tulpMsg = `> ${referenceMsg}\n<@${reference.author.id}>\n\n${tulpMsg}`;
        }

        //-------------------------------------------------------------------------------------
        // detect dm channel

        if (msg.channel.type === 'dm') {
            const simulatedMsg = new Discord.MessageEmbed()
                .setAuthor(selectedTulp.username, selectedTulp.avatar)
                .setDescription(tulpMsg);

            msg.channel.send(simulatedMsg);
        }
        else {
            // send webhook message
            msg.delete();
            msgUtils.sendWebhookMsg(msg, tulpMsg, selectedTulp.username, selectedTulp.avatar);
        }

        return true;
    }
}