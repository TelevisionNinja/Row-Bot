const Discord = require('discord.js');
const { tulp: tulpCollection } = require('../../../lib/database.js');
const msgUtils = require('../../../lib/msgUtils.js');
const stringUtils = require('../../../lib/stringUtils.js');

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

        if (msg.reference) {
            const reference = await msg.channel.messages.fetch(msg.reference.messageID);
            let referenceMsg = reference.cleanContent;
            let mention;

            // format mention and jump link
            if (reference.webhookID === reference.author.id) {
                mention = `[@${reference.author.username}](${reference.url})`;

                // remove reference inside of reference
                referenceMsg = referenceMsg.replace(/^(> )(.|\n){0,}(\[.{0,}\]\(https:\/\/discord\.com\/channels\/.{0,}\)\n\n)/i, '');
            }
            else {
                mention = `<@${reference.author.id}> - [jump](${reference.url})`;
            }

            // detect embed or prevent embed from showing
            if (!referenceMsg.length || stringUtils.containsURL(referenceMsg)) {
                referenceMsg = `[*Select to see attachment*](${reference.url})`;
            }
            else {
                // put the referenced msg in a quote
                referenceMsg = stringUtils.cutOff(referenceMsg.replaceAll('\n', '\n> '), 64);
            }

            // check if the msg is over the discord char limit
            tulpMsg = stringUtils.cutOff(`> ${referenceMsg}\n${mention}\n\n${tulpMsg}`, 2000);
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