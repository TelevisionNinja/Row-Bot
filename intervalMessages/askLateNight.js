const {
    aliases,
    askLateNight
} = require('../config.json');
const { acknowledgements } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');
const interval = require('../lib/interval.js');
const msgUtils = require('../lib/msgUtils.js');

module.exports = {
    description: askLateNight.description,
    execute(client) {
        const time = askLateNight.time.split(':').map(i => parseInt(i));

        interval.startIntervalFunc(
            () => {
                ask(
                    client,
                    askLateNight.channelID,
                    askLateNight.msg,
                    askLateNight.noReplyMsg,
                    askLateNight.timeOut // time out is in ms
                );
            },
            1440, // 24 hrs in minutes
            time[0],
            time[1],
            true
        );
    }
}

async function ask(client, ID, msg, noReplayMsg, timeOut) {
    const recipient = await msgUtils.getRecipient(client, ID);

    await msgUtils.sendTypingMsg(recipient, msg, '');

    const collector = recipient.createMessageCollector(m => {
        const str = m.content.toLowerCase();
        return aliases.some(a => str.includes(a));
    }, { time: timeOut });

    let stop = false;

    collector.on('collect', m => {
        const str = m.content.toLowerCase();
        const wordArr = str.split(' ');
        
        if (wordArr.includes('no')) {
            msgUtils.sendTypingMsg(recipient, 'aww', str);
            stop = true;
        }
        else if (wordArr.includes('yes')) {
            msgUtils.sendTypingMsg(recipient, acknowledgements[rand.randomMath(acknowledgements.length)], str);
            stop = true;
        }

        if (stop) {
            collector.stop();
            return;
        }
    });

    collector.on('end', () => {
        if (stop) {
            const memberArr = msgUtils.getUsersInChannelByChannelID(recipient.guild, '786111956527349821');

            memberArr.forEach(async m => {
                const currentRecipient = await msgUtils.getRecipient(client, m.id);

                msgUtils.sendDirectDm(currentRecipient, askLateNight.successMsg, true);
            });
        }
        else {
            msgUtils.sendTypingMsg(recipient, noReplayMsg, '');
        }
    });
}