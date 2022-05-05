import { sendWebhookMsg } from '../../../lib/msgUtils.js';
import { containsURL } from '../../../lib/urlUtils.js';
import { cutOff } from '../../../lib/stringUtils.js';
import { tulps } from '../../../lib/database.js';

export default {
    usage: '<custom bracket><message><custom bracket>',
    /**
     * send tulp messages using brackets
     * 
     * @param {*} msg message obj
     * @returns 
     */
    async sendEasyMsg(msg) {
        //-------------------------------------------------------------------
        // get specific tulp
        const selectedTulp = await tulps.findTulp(msg.author.id, msg.content);

        if (!selectedTulp) {
            return false;
        }

        let tulpMsg = msg.content;
        tulpMsg = tulpMsg.substring(selectedTulp.start_bracket.length, tulpMsg.length - selectedTulp.end_bracket.length).trim();
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
            let mention = undefined;

            // format mention and jump link
            if (reference.webhookId === reference.author.id) {
                mention = `[@${reference.author.username}](${reference.url})`;

                // remove reference inside of reference
                referenceMsg = referenceMsg.replace(/^(> )(.|\n){1,}(\[.{1,}\]\(https:\/\/discord\.com\/channels\/([0-9]{1,}|@me)\/[0-9]{1,}\/[0-9]{1,}\)\n)/i, '').trimStart();
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

        if (msg.channel.type === 'DM') { // send emulated message
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
        else { // send webhook message
            sendWebhookMsg(msg, {
                content: tulpMsg,
                username: selectedTulp.username,
                avatarURL: selectedTulp.avatar,
                files: attachmentArr
            });

            try {
                await msg.delete();
            }
            catch (error) {
                console.log(error);
            }
        }

        return true;
    }
}
