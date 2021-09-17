import { default as config } from '../../config.json';
import { default as tulpConfigFile } from './tulpConfig.json';
import { default as sendEasyMsg } from './easyMessages/sendEasyMsg.js';
import { sendWebhookMsg } from '../../lib/msgUtils.js';
import { tulps } from '../../lib/database.js';
import { containsURL } from '../../lib/urlUtils.js';
import { cutOff } from '../../lib/stringUtils.js';
import { Constants } from 'discord.js';

const tulpConfig = config.tulp,
    tagSeparator = config.tagSeparator,
    sendMsg = tulpConfigFile.sendMsg,
    easyUsage = sendEasyMsg.usage;

export default {
    interactionData: {
        name: sendMsg.names[0],
        description: sendMsg.description,
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        options: [
            {
                name: 'name',
                description: 'The name',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'message',
                description: 'The message',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    },
    names: sendMsg.names,
    description: sendMsg.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: `<name>${tagSeparator} <message>\`\nor the easier way:\n\`${easyUsage}`,
    async execute(msg, args) {
        const isDM = msg.channel.type === 'DM';

        if (!isDM) {
            msg.delete();
        }

        const str = args.join(' ');
        const index = str.indexOf(tagSeparator);

        if (index === -1) {
            return;
        }

        let tulpMsg = str.substring(index + 1).trimStart();
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
            msg.author.send(tulpConfig.noDataMsg);
            return;
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

        if (isDM) {
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
            // webhook
            sendWebhookMsg(msg, tulpMsg, attachmentArr, selectedTulp.username, selectedTulp.avatar);
        }
    },
    async executeInteraction(interaction) {
        const isDM = interaction.channel.type === 'DM';

        if (!isDM) {
            interaction.deferReply();
            interaction.deleteReply();
        }

        const tulpMsg = interaction.options.getString('message');

        // get specific tulp using username
        const username = interaction.options.getString('name');
        const selectedTulp = await tulps.get(interaction.user.id, username);

        if (typeof selectedTulp === 'undefined') {
            interaction.user.send(tulpConfig.noDataMsg);
            return;
        }

        //-------------------------------------------------------------------------------------
        // detect dm channel

        if (isDM) {
            interaction.channel.send({
                embeds: [{
                    author: {
                        name: selectedTulp.username,
                        icon_url: selectedTulp.avatar
                    },
                    description: tulpMsg
                }]
            });
        }
        else {
            // webhook
            sendWebhookMsg(interaction, tulpMsg, undefined, selectedTulp.username, selectedTulp.avatar);
        }
    }
}
