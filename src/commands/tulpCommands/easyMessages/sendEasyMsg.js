import {
    sendWebhookMsg,
    buildReferenceMsg
} from '../../../lib/msgUtils.js';
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
        tulpMsg = tulpMsg.substring(selectedTulp.start_bracket_length, tulpMsg.length - selectedTulp.end_bracket_length).trim();
        let attachmentArr = undefined;

        if (msg.attachments.size) {
            attachmentArr = msg.attachments.map(img => img.url);
        }
        else if (!tulpMsg.length) {
            return false;
        }

        //-------------------------------------------------------------------------------------
        // referenced msg

        tulpMsg = await buildReferenceMsg(msg, tulpMsg);

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
        else {
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
