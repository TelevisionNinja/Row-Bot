import { tulps } from '../../../lib/database.js';
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
     * @param {*} tulpArr tulp array
     * @param {*} webhook webhook
     * @returns 
     */
    async sendEasyMsg(msg, tulpArr, webhook) {
        // find user data if not cached
        if (typeof tulpArr === 'undefined') {
            tulpArr = await tulps.getAll(msg.author.id);

            if (!tulpArr.length) {
                return false;
            }
        }

        //-------------------------------------------------------------------
        // get specific tulp

        const userMessage = msg.content;
        let selectedTulp = {
            start_bracket: '',
            end_bracket: ''
        };

        for (let i = 0, n = tulpArr.length; i < n; i++) {
            const currentTulp = tulpArr[i];

            if (currentTulp.start_bracket.length >= selectedTulp.start_bracket.length &&
                currentTulp.end_bracket.length >= selectedTulp.end_bracket.length &&
                userMessage.startsWith(currentTulp.start_bracket) &&
                userMessage.endsWith(currentTulp.end_bracket)) {
                selectedTulp = currentTulp;
            }
        }

        if (typeof selectedTulp.username === 'undefined') {
            return false;
        }

        let tulpMsg = userMessage.substring(selectedTulp.start_bracket.length, userMessage.length - selectedTulp.end_bracket.length).trim();
        let attachmentArr = undefined;

        if (msg.attachments.size) {
            attachmentArr = msg.attachments.map(img => img.url);
        }
        else if (!tulpMsg.length) {
            return false;
        }

        //-------------------------------------------------------------------------------------
        // referenced msg

        if (msg.reference) {
            const reference = await msg.fetchReference();
            let referenceMsg = reference.cleanContent;
            let mention;

            // format mention and jump link
            if (reference.webhookId === reference.author.id) {
                mention = `[@${reference.author.username}](${reference.url})`;

                // remove reference inside of reference
                referenceMsg = referenceMsg.replace(/^(> )(.|\n){1,}(\[.{1,}\]\(https:\/\/discord\.com\/channels\/.{0,}\)\n)/i, '').trim();
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

        if (msg.channel.type === 'DM') {
            let imageObj = undefined;

            if (typeof attachmentArr !== 'undefined') {
                imageObj = {
                    url: attachmentArr[0]
                };
            }

            msg.channel.send({
                embeds: [{
                    author: {
                        name: selectedTulp.username,
                        icon_url: selectedTulp.avatar
                    },
                    description: tulpMsg,
                    image: imageObj
                }]
            });
        }
        else {
            // send webhook message
            msg.delete();
            sendWebhookMsgUsingWebhook(msg, tulpMsg, attachmentArr, selectedTulp.username, selectedTulp.avatar, webhook);
        }

        return true;
    }
}