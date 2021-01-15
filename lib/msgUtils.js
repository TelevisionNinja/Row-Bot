const {
    readingSpeed, // this is wpm
    typingSpeed, // this is wpm
    reactionSpeed, // this is ms
    clientID
} = require('../config.json');

module.exports = {
    sendImg,
    sendTypingMsg,
    getRecipient,
    sendAuthorDm,
    sendDirectDm,
    hasBotMention,
    hasMentions,
    parseUserMentions
}

/**
 * sends an image
 * 
 * @param {*} client 
 * @param {*} img image
 * @param {*} source source url
 * @param {*} results number of image results or not
 * @param {*} sendResults bool to send results with the image
 */
function sendImg(client, img, source, results, sendResults = true) {
    let text = 'Aww there\'s no results 😢';
    
    if (results) {
        client.send(img);

        text = `Source: <${source}>`;
        
        if (sendResults) {
            text = `${text}\nResults: ${results}`;
        }
    }

    client.send(text);
}

/**
 * starts typing and then sends a message
 * 
 * @param {*} client 
 * @param {*} sendingMsg 
 * @param {*} readingMsg 
 */
function sendTypingMsg(client, sendingMsg, readingMsg) {
    /*
        wpm to ms per char formula
        (1000 ms) / (wpm / (60 s) * (6 chars per word))
        = (1000 ms) * (60 s) / (wpm * (6 chars per word))
        = (1000 ms) * (10 s) / wpm
    */
    const typingSpeedMs = 10000 / typingSpeed;
    const readingSpeedMs = 10000 / readingSpeed;

    return new Promise(r => {
        setTimeout(() => {
            client.startTyping();

            setTimeout(async () => {
                client.stopTyping();
                await client.send(sendingMsg);
                r();
            }, sendingMsg.length * typingSpeedMs + reactionSpeed); // time before sending
        }, readingMsg.length * readingSpeedMs + reactionSpeed) // time before typing
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} ID channel id
 */
async function getRecipient(client, ID) {
    const recipient = await client.channels.fetch(ID);
    
    if (typeof recipient === 'undefined') {
        return await client.users.fetch(ID);
    }

    return recipient;
}

/**
 * Sends a message to the author's DM's.
 * 
 * @param {*} msg Discord.Message
 * @param {*} data message to be sent through DM's
 */
async function sendAuthorDm(msg, data) {
    try {
        await msg.author.send(data);

        if (msg.channel.type === 'dm') {
            return;
        }
        
        msg.reply('I\'ve sent you a DM');
    }
    catch (error) {
        console.log(error);
        msg.reply('I couldn\'t DM you 😢');
    }
}

/**
 * Sends a message to someone's DM's.
 * 
 * @param {*} client Discord.Message
 * @param {*} msg message to be sent through DM's
 * @param {*} sendTyping send a typing message or not, default value is false
 * @param {*} readingMsg message to read before typing, default value is an empty string
 */
async function sendDirectDm(client, msg, sendTyping = false, readingMsg = '') {
    if (sendTyping) {
        const dm = await client.createDM();

        sendTypingMsg(dm, msg, readingMsg);
    }
    else {
        client.send(msg);
    }
}

/**
 * if the bot itself or one of its roles is mentioned, true will be returned
 * 
 * @param {*} msg 
 * @param {*} everyone check for mentions of everyone in the channel, default is true
 * @param {*} users check for mentions of users in the channel, default is true
 * @param {*} roles check for mentions of roles in the channel, default is true
 */
function hasBotMention(msg, everyone = true, users = true, roles = true) {
    if (everyone) {
        if (msg.mentions.everyone) {
            return true;
        }
    }

    if (users) {
        const userMentionArr = [...msg.mentions.users.values()].map(m => m.id);

        if (userMentionArr.length) {
            if (userMentionArr.includes(clientID)) {
                return true;
            }
        }
    }

    if (roles) {
        const roleMentionArr = [...msg.mentions.roles.values()].map(m => m.id);

        if (roleMentionArr.length) {
            const botRoles = msg.guild.members.cache.get(clientID)._roles;

            if (roleMentionArr.some(r => botRoles.includes(r))) {
                return true;
            }
        }
    }

    return false;
}

/**
 * if there are any pf the specified mentions, true will be returned
 * 
 * @param {*} msg 
 * @param {*} everyone check for mentions of everyone in the channel, default is true
 * @param {*} users check for mentions of users in the channel, default is true
 * @param {*} roles check for mentions of roles in the channel, default is true
 */
function hasMentions(msg, everyone = true, users = true, roles = true) {
    if (everyone) {
        if (msg.mentions.everyone) {
            return true;
        }
    }

    if (users) {
        if ([...msg.mentions.users.values()].length) {
            return true;
        }
    }

    if (roles) {
        if ([...msg.mentions.roles.values()].length) {
            return true;
        }
    }

    return false;
}

/**
 * returns an array of mentioned user ID's in the order they appear in the message
 * 
 * @param {*} msg 
 */
function parseUserMentions(msg) {
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