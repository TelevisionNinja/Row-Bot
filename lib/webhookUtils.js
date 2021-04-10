const { clientID } = require('../config.json');

module.exports = {
    sendMsg
}

/**
 * send webhook messages
 * 
 * @param {*} discordMsg 
 * @param {*} msg 
 * @param {*} name 
 * @param {*} avatar 
 */
async function sendMsg(discordMsg, msg, name, avatar) {
    const channelWebhooks = await discordMsg.guild.fetchWebhooks();
    let webhook = channelWebhooks.find(w => w.owner.id === clientID);

    if (typeof webhook === 'undefined') {
        try {
            webhook = await discordMsg.channel.createWebhook(name);
        }
        catch (error) {
            console.log(error);
            return;
        }
    }
    else {
        await webhook.edit({
            channel: discordMsg.channel.id,
            name: name,
            avatar: avatar
        });
    }

    webhook.send(msg);
}