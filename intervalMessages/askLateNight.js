const {
    aliases,
    askLateNight
} = require('../config.json');
const { acknowledgements } = require('../messages.json');
const rand = require('../lib/randomFunctions.js');
const interval = require('../lib/interval.js');
const sendMsg = require('../lib/msgUtils.js');

module.exports = {
    description: askLateNight.description,
    execute(client) {
        const time = askLateNight.time.split(':').map(i => parseInt(i));

        interval.executeIntervalFunc(
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
            time[1]
        );
    }
}

async function ask(client, ID, msg, noReplayMsg, timeOut) {
    const recipient = await sendMsg.getRecipient(client, ID);

    await sendMsg.sendTypingMsg(recipient, msg, '');

    const collector = recipient.createMessageCollector(m => aliases.some(a => m.content.toLowerCase().includes(a)), { time: timeOut });

    let stop = false;

    collector.on('collect', m => {
        const str = m.content.toLowerCase();
        
        if (str.includes('no')) {
            sendMsg.sendTypingMsg(recipient, 'aww', str);
            stop = true;
            collector.stop();
            return;
        }
        if (str.includes('yes')) {
            sendMsg.sendTypingMsg(recipient, acknowledgements[rand.randomMath(acknowledgements.length)], str);
            stop = true;
            collector.stop();
            return;
        }
    });

    collector.on('end', () => {
        if (!stop) {
            recipient.send(noReplayMsg);
        }
    });
}