import { default as config } from '../../config.json';
import { default as tulpConfigFile } from './tulpConfig.json';
import { default as sendEasyMsg } from './easyMessages/sendEasyMsg.js';
import { sendWebhookMsg } from '../../lib/msgUtils.js';
import { tulps } from '../../lib/database.js';

const tulpConfig = config.tulp,
    tagSeparator = config.tagSeparator,
    sendMsg = tulpConfigFile.sendMsg,
    easyUsage = sendEasyMsg.usage;

export default {
    names: sendMsg.names,
    description: sendMsg.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: `<name>${tagSeparator} <message>\`\nor the easier way:\n\`${easyUsage}`,
    async execute(msg, args) {
        const isDM = msg.channel.type === 'dm';

        if (!isDM) {
            msg.delete();
        }

        const str = args.join(' ');
        const index = str.indexOf(tagSeparator);

        if (index === -1 || index === str.length - 1) {
            return;
        }

        const tulpMsg = str.substring(index + 1).trim();
        let attachmentArr = undefined;

        if (msg.attachments.size) {
            attachmentArr = msg.attachments.map(img => img.url);
        }
        else if (!tulpMsg.length) {
            return;
        }

        // get specific tulp using username
        const username = str.substring(0, index).trim();
        const selectedTulp = await tulps.get(msg.author.id, username);

        if (typeof selectedTulp === 'undefined') {
            msg.channel.send(tulpConfig.noDataMsg);
            return;
        }

        //-------------------------------------------------------------------------------------
        // detect dm channel

        if (isDM) {
            let imageObj = undefined;

            if (typeof attachmentArr !== 'undefined') {
                imageObj = {
                    url: attachmentArr[0]
                };
            }

            msg.channel.send({
                embed: {
                    author: {
                        name: selectedTulp.username,
                        icon_url: selectedTulp.avatar
                    },
                    description: tulpMsg,
                    image: imageObj
                }
            });
        }
        else {
            // webhook
            sendWebhookMsg(msg, tulpMsg, attachmentArr, selectedTulp.username, selectedTulp.avatar);
        }
    }
}