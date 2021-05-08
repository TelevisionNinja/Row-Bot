import { tulp as tulpCollection } from '../../../lib/database.js';
import { sendWebhookMsgUsingWebhook } from '../../../lib/msgUtils.js';
import {
    containsURL,
    cutOff
} from '../../../lib/stringUtils.js';

export default {
    usage: '<custom bracket><message><custom bracket>',
    /**
     * send tulp message using the tulp cache
     * 
     * @param {*} msg message obj
     * @param {*} userData user data
     * @param {*} webhook webhook
     * @returns 
     */
     async sendEasyMsg(msg, userData, webhook) {
        // find user data if not cached
        if (typeof userData === 'undefined') {
            const query = { _id: msg.author.id };
            userData = await tulpCollection.findOne(query);

            if (userData === null) {
                return false;
            }
        }

        //-------------------------------------------------------------------
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
                mention = `[@${reference.author.username}](${reference.jumpLink})`;

                // remove reference inside of reference
                referenceMsg = referenceMsg.replace(/^(> )(.|\n){1,}(\[.{1,}\]\(https:\/\/discord\.com\/channels\/.{0,}\)\n)/i, '').trim();
            }
            else {
                mention = `<@${reference.author.id}> - [jump](${reference.jumpLink})`;
            }

            // detect embed or prevent embed from showing
            if (!referenceMsg.length || containsURL(referenceMsg)) {
                referenceMsg = `[*Select to see attachment*](${reference.jumpLink})`;
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

        if (msg.channel.type === 1) {
            msg.channel.createMessage({
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
            sendWebhookMsgUsingWebhook(msg, tulpMsg, selectedTulp.username, selectedTulp.avatar, webhook);
        }

        return true;
    }
}