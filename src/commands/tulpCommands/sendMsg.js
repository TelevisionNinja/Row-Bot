import config from '../../../config/config.json' with { type: 'json' };
import tulpConfigFile from '../../../config/tulpConfig.json' with { type: 'json' };
import { default as sendEasyMsg } from './easyMessages/sendEasyMsg.js';
import {
    sendWebhookMsg,
    buildReferenceMsg
} from '../../lib/msgUtils.js';
import { tulps } from '../../lib/database.js';
import {
    ApplicationCommandOptionType,
    ChannelType
} from 'discord.js';

const tulpConfig = config.tulp,
    tagSeparator = config.tagSeparator,
    sendMsg = tulpConfigFile.sendMsg,
    easyUsage = sendEasyMsg.usage;

export default {
    interactionData: {
        name: sendMsg.names[0],
        description: sendMsg.description,
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: 'name',
                description: 'The name',
                required: true,
                type: ApplicationCommandOptionType.String
            },
            {
                name: 'message',
                description: 'The message',
                required: true,
                type: ApplicationCommandOptionType.String
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
        const isDM = msg.channel.type === ChannelType.DM;

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

        tulpMsg = await buildReferenceMsg(msg, tulpMsg);

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
            sendWebhookMsg(msg, {
                content: tulpMsg,
                username: selectedTulp.username,
                avatarURL: selectedTulp.avatar,
                files: attachmentArr
            });
        }
    },
    async executeInteraction(interaction) {
        // await interaction.deferReply();

        const tulpMsg = interaction.options.getString('message');

        // get specific tulp using username
        const username = interaction.options.getString('name');
        const selectedTulp = await tulps.get(interaction.user.id, username);

        if (typeof selectedTulp === 'undefined') {
            interaction.reply({
                content: tulpConfig.noDataMsg,
                ephemeral: true
            });

            return;
        }

        // interaction.deleteReply();

        //-------------------------------------------------------------------------------------
        // detect dm channel

        if (interaction.inGuild()) {
            // webhook
            sendWebhookMsg(interaction, {
                content: tulpMsg,
                username: selectedTulp.username,
                avatarURL: selectedTulp.avatar
            });
        }
        else {
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
    }
}
