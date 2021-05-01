import { tulp as tulpCollection } from '../../../lib/database.js';
import { sendWebhookMsg } from '../../../lib/msgUtils.js';
import {
    containsURL,
    cutOff
} from '../../../lib/stringUtils.js';

export default {
    usage: '<custom bracket><message><custom bracket>',
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

        for (let i = 0, n = tulpArr.length; i < n; i++) {
            const currentTulp = tulpArr[i];

            if (currentTulp.startBracket.length >= selectedTulp.startBracket.length &&
                currentTulp.endBracket.length >= selectedTulp.endBracket.length &&
                userMessage.startsWith(currentTulp.startBracket) &&
                userMessage.endsWith(currentTulp.endBracket)) {
                selectedTulp = currentTulp;
            }
        }

        if (typeof selectedTulp.username === 'undefined') {
            return false;
        }

        let tulpMsg = userMessage.substring(selectedTulp.startBracket.length, userMessage.length - selectedTulp.endBracket.length).trim();

        if (!tulpMsg.length) {
            return false;
        }

        //-------------------------------------------------------------------------------------
        // referenced msg

        const reference = msg.referencedMessage;

        if (reference) {
            let referenceMsg = reference.cleanContent;
            let mention;

            // format mention and jump link
            if (reference.webhookID === reference.author.id) {
                mention = `[@${reference.author.username}](${reference.url})`;

                // remove reference inside of reference
                referenceMsg = referenceMsg.replace(/^(> )(.|\n){1,}(\[.{1,}\]\(https:\/\/discord\.com\/channels\/.{0,}\)\n)/i, '');
            }
            else {
                mention = `<@${reference.author.id}> - [jump](${reference.url})`;
            }

            // detect embed or prevent embed from showing
            if (!referenceMsg.length || containsURL(referenceMsg)) {
                referenceMsg = `[*Select to see attachment*](${reference.url})`;
            }
            else {
                // put the referenced msg in a quote
                referenceMsg = cutOff(referenceMsg.replaceAll('\n', '\n> '), 64);
            }

            // check if the msg is over the discord char limit
            tulpMsg = cutOff(`> ${referenceMsg}\n${mention}\n${tulpMsg}`, 2000);
        }

        //-------------------------------------------------------------------------------------
        // detect dm channel

        if (msg.channel.type === 'dm') {
            msg.channel.send({
                embed: {
                    author: {
                        name: selectedTulp.username,
                        icon_url: selectedTulp.avatar
                    },
                    description: tulpMsg
                }
            });
        }
        else {
            // send webhook message
            msg.delete();
            sendWebhookMsg(msg, tulpMsg, selectedTulp.username, selectedTulp.avatar);
        }

        return true;
    }
}