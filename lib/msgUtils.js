const {
    readingSpeed, // this is wpm
    typingSpeed, // this is wpm
    reactionSpeed // this is ms
} = require('../config.json');

module.exports = {
    sendImg,
    sendTypingMsg,
    getRecipient,
    sendAuthorDm,
    sendDirectDm
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