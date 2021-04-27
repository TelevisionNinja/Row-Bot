import { default as config } from '../config.json';
import {
    cutOff,
    isValidURL
} from './stringUtils.js';
import { tulpWebhooks } from './database.js';

const readingSpeed = config.readingSpeed, // this is wpm
    typingSpeed = config.typingSpeed, // this is wpm
    reactionSpeed = config.reactionSpeed, // this is ms
    clientID = config.clientID,
    noResultsMsg = config.noResultsMsg,
    tagSeparator = config.tagSeparator,
    rule = config.rule;

/**
 * sends an image
 * 
 * @param {*} client 
 * @param {*} img image object
 * @param {*} sendResults bool to send results with the image
 */
export function sendImg(client, img, sendResults = true) {
    if (img.results) {
        const extension = img.url.substring(img.url.lastIndexOf('.') + 1).toLowerCase();

        if (extension === 'webm' || extension === 'mp4') {
            let infoText = 'Source: ';

            if (img.website === rule.websiteName) {
                img.source = `<${img.source}>`;
                infoText = `${img.url}\n${infoText}`;
            }

            infoText = `${infoText}${img.source}`;

            if (sendResults) {
                infoText = `${infoText}\nResults: ${img.results}`;
            }

            client.createMessage(infoText);
        }
        else {
            let embedObj = {
                fields: [],
                url: img.source,
                color: parseInt(img.embedColor, 16),
                image: {
                    url: img.url
                },
                title: 'Source'
            };

            if (img.title.length) {
                embedObj.author = { name: img.title };
            }

            if (img.description.length) {
                embedObj.fields.push(
                    {
                        name: 'Description',
                        value: cutOff(img.description, 1024)
                    }
                );
            }

            if (img.artist.length) {
                embedObj.fields.push(
                    {
                        name: img.artist.length === 1 ? 'Artist' : 'Artists',
                        value: cutOff(img.artist.join(', '), 1024)
                    }
                );
            }

            if (sendResults) {
                embedObj.footer = { text: `Results: ${img.results}` };
            }

            client.createMessage({ embed: embedObj });
        }
    }
    else {
        client.createMessage(noResultsMsg);
    }
}

/**
 * starts typing and then sends a message
 * 
 * @param {*} client 
 * @param {*} sendingMsg 
 * @param {*} readingMsg 
 * @returns 
 */
export function sendTypingMsg(client, sendingMsg, readingMsg) {
    /*
        wpm to ms per char formula
        (1000 ms) / (wpm / (60 s) * (6 chars per word))
        = (1000 ms) * (60 s) / (wpm * (6 chars per word))
        = (1000 ms) * (10 s) / wpm
    */
    const typingSpeedMs = 10000 / typingSpeed;
    const readingSpeedMs = 10000 / readingSpeed;

    let typingTime = sendingMsg.length * typingSpeedMs + reactionSpeed;
    let readingTime = readingMsg.length * readingSpeedMs + reactionSpeed;

    // limit of 30 seconds
    if (typingTime > 30000) {
        typingTime = 30000;
    }

    if (readingTime > 30000) {
        readingTime = 30000;
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            client.sendTyping();

            setTimeout(async () => {
                try {
                    await client.createMessage(sendingMsg);
                    resolve();
                }
                catch (error) {
                    console.log(error);
                    reject();
                }
            }, typingTime); // time before sending
        }, readingTime) // time before typing
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} ID channel id
 * @returns 
 */
export async function getRecipient(client, ID) {
    const recipient = client.getChannel(ID);

    if (typeof recipient === 'undefined') {
        return await client.getDMChannel(ID);
    }

    return recipient;
}

/**
 * Sends a message to the author's DM's.
 * 
 * @param {*} msg eris Message obj
 * @param {*} content message to be sent through DM's
 * @param {*} file 
 * @returns 
 */
export async function sendAuthorDm(msg, content, file = []) {
    try {
        const DM = await msg.author.getDMChannel(msg.author.id);
        await DM.createMessage(content, file);

        if (msg.channel.type === 1) {
            return;
        }

        msg.channel.createMessage('I\'ve sent you a DM');
    }
    catch (error) {
        console.log(error);
        msg.channel.createMessage('I couldn\'t DM you 😢');
    }
}

/**
 * Sends a message to someone's DM's.
 * 
 * @param {*} client channel
 * @param {*} msg message to be sent through DM's
 * @param {*} sendTyping send a typing message or not, default value is false
 * @param {*} readingMsg message to read before typing, default value is an empty string
 */
export async function sendDirectDm(client, msg, sendTyping = false, readingMsg = '') {
    if (sendTyping) {
        const dm = await client.createDM();

        sendTypingMsg(dm, msg, readingMsg);
    }
    else {
        client.createMessage(msg);
    }
}

/**
 * if the bot itself or one of its roles is mentioned, true will be returned
 * 
 * @param {*} msg 
 * @param {*} everyone check for mentions of everyone in the channel, default is true
 * @param {*} users check for mentions of users in the channel, default is true
 * @param {*} roles check for mentions of roles in the channel, default is true
 * @returns 
 */
export function hasBotMention(msg, everyone = true, users = true, roles = true) {
    if (everyone) {
        if (msg.mentionEveryone) {
            return true;
        }
    }

    if (users) {
        for (let i = 0, n = msg.mentions.length; i < n; i++) {
            if (msg.mentions[i].id === clientID) {
                return true;
            }
        }
    }

    if (roles) {
        const roleMentionArr = msg.roleMentions;

        if (roleMentionArr.length) {
            const botRoles = msg.channel.guild.members.get(clientID).roles;

            for (let i = 0, n = roleMentionArr.length; i < n; i++) {
                if (botRoles.includes(roleMentionArr[i])) {
                    return true;
                }
            }
        }
    }

    return false;
}

/**
 * if there are any of the specified mentions, true will be returned
 * 
 * @param {*} msg 
 * @param {*} everyone check for mentions of everyone in the channel, default is true
 * @param {*} users check for mentions of users in the channel, default is true
 * @param {*} roles check for mentions of roles in the channel, default is true
 * @returns 
 */
export function hasMentions(msg, everyone = true, users = true, roles = true) {
    if (everyone) {
        if (msg.mentionEveryone) {
            return true;
        }
    }

    if (users) {
        if (msg.mentions.length || msg.referencedMessage) {
            return true;
        }
    }

    if (roles) {
        if (msg.roleMentions.length) {
            return true;
        }
    }

    return false;
}

/**
 * 
 * @param {*} msg 
 * @returns an array of mentioned user ID's in the order they appear in the message
 */
export function parseUserMentions(msg) {
    const words = msg.content.split(' ');

    let mentions = [];

    for (let i = 0, n = words.length; i < n; i++) {
        let word = words[i];

        if (word.startsWith('<@') && word.endsWith('>')) {
            word = word.slice(2, -1);

            if (word.startsWith('!')) {
                word = word.slice(1);
            }

            mentions.push(word);
        }
    }

    return mentions;
}

/**
 * gets the username and image link from a message
 * 
 * @param {*} msg 
 * @param {*} args 
 * @returns 
 * success: if there is a username and avatar detected
 * 
 * validURL: if the link of the image is valid
 * 
 * username: extracted username string
 * 
 * avatarLink: extracted avatar link
 */
export function extractNameAndAvatar(msg, args) {
    let validURL = true;
    let username = '';
    let avatarLink = '';
    const argArr = args.join(' ').split(tagSeparator);
    const attachment = msg.attachments[0];
    const extractedUsername = argArr.shift().trim();
    const link = argArr.join(tagSeparator).trim();
    const success = (attachment || link.length) && extractedUsername.length;

    if (success) {
        username = extractedUsername;

        if (attachment) {
            avatarLink = attachment.url;
        }
        else {
            avatarLink = link;
            validURL = isValidURL(avatarLink);
        }
    }

    return {
        success,
        validURL,
        username,
        avatarLink
    }
}

/**
 * 
 * @param {*} msg 
 * @returns webhook
 */
async function getWebhook(msg) {
    const query = { _id: msg.channel.id };
    let webhook = await tulpWebhooks.findOne(query);

    if (webhook) {
        return webhook.webhook;
    }

    const channelWebhooks = await msg.channel.getWebhooks();
    webhook = channelWebhooks.find(w => w.owner.id === clientID);

    if (!webhook) {
        webhook = await msg.channel.createWebhook({ name: msg.channel.client.user.username });
    }

    const update = {
        $set: {
            webhook: {
                id: webhook.id,
                token: webhook.token
            }
        }
    };

    tulpWebhooks.updateOne(query, update, { upsert: true });

    return webhook;
}

/**
 * send webhook messages
 * 
 * @param {*} msgObj 
 * @param {*} msg 
 * @param {*} name 
 * @param {*} avatar 
 */
export async function sendWebhookMsg(msgObj, msg, name, avatar) {
    const webhook = await getWebhook(msgObj);

    try {
        await msgObj.channel.client.executeWebhook(webhook.id, webhook.token, {
            content: msg,
            username: name,
            avatarURL: avatar
        });
    }
    catch (error) {
        // Unknown Webhook error
        if (error.code === 10015) {
            await tulpWebhooks.deleteOne({ _id: msgObj.channel.id });
            sendWebhookMsg(msgObj, msg, name, avatar);
        }
    }
}
