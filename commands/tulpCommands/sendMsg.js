import { default as config } from '../../config.json';
import { default as tulpConfigFile } from './tulpConfig.json';
import { default as sendEasyMsg } from './easyMessages/sendEasyMsg.js';
import { tulp as tulpCollection } from '../../lib/database.js';
import { sendWebhookMsg } from '../../lib/msgUtils.js';

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

        if (!tulpMsg.length) {
            return;
        }

        // get specific tulp using username
        const username = str.substring(0, index).trim();
        const query = { _id: msg.author.id };
        const options = {
            projection: {
                tulps: {
                    $elemMatch: {
                        username: username
                    }
                }
            }
        }
        const userData = await tulpCollection.findOne(query, options);

        if (userData === null) {
            msg.channel.createMessage(tulpConfig.notUserMsg);
            return;
        }

        if (typeof userData.tulps === 'undefined') {
            msg.channel.createMessage(tulpConfig.noDataMsg);
            return;
        }

        const selectedTulp = userData.tulps[0];

        //-------------------------------------------------------------------------------------
        // detect dm channel

        if (isDM) {
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
            // webhook
            sendWebhookMsg(msg, tulpMsg, selectedTulp.username, selectedTulp.avatar);
        }
    }
}