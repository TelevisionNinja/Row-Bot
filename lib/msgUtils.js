const {
    readingSpeed, // this is wpm
    typingSpeed, // this is wpm
    reactionSpeed // this is ms
} = require('../config.json');

module.exports = {
    sendImg,
    sendTypingMsg,
    getRecipient,
    sendDm
}

/**
 * sends an image
 * 
 * @param {*} client 
 * @param {*} img image
 * @param {*} source source url
 * @param {*} results number of image results or not
 * @param {*} sendResults bool to send results a
 */
async function sendImg(client, img, source, results, sendResults = true) {
    if (results) {
        client.send(img);
        if (sendResults) {
            client.send(`Source: <${source}>\nResults: ${results}`);
        }
        else {
            client.send(`Source: <${source}>`);
        }
    }
    else {
        client.send('Aww there\'s no results 😢');
    }
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

    setTimeout(() => {
        client.startTyping();

        setTimeout(() => {
            client.stopTyping();
            client.send(botReplay);
        }, sendingMsg.length * typingSpeedMs + reactionSpeed); // time before sending
    }, readingMsg.length * readingSpeedMs + reactionSpeed); // time before typing
}

/**
 * 
 * @param {*} client 
 * @param {*} ID channel id
 */
async function getRecipient(client, ID) {
    const recipient = client.channels.cache.get(ID);
    
    if (typeof recipient === 'undefined') {
        return await client.users.fetch(ID);
    }

    return recipient;
}

/**
 * Sends a message to the author's DM's.
 * Splits the message into multiple messages if it exceeds the discord char limit.
 * 
 * @param {*} msg Discord.Message
 * @param {*} data message to be sent through DM's
 */
async function sendDm(msg, data) {
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