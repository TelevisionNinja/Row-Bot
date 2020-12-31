const { askLateNight } = require('../config.json');
const interval = require('../lib/interval.js');
const sendMsg = require('../lib/msgUtils.js');

module.exports = {
    description: askLateNight.description,
    execute(client) {
        const time = askLateNight.time.split(':').map(i => parseInt(i));

        interval.execute24HrIntervalFunc(
            () => {
                ask(
                    client,
                    askLateNight.channelID,
                    askLateNight.msg,
                    askLateNight.noReplyMsg,
                    askLateNight.timeOut
                );
            },
            time[0],
            time[1]
        );
    }
}

async function ask(client, ID, msg, noReplayMsg, timeOut) {
    const recipient = await sendMsg.getRecipient(client, ID);

    recipient.send(msg);

    const collector = recipient.createMessageCollector(m => m, { time: timeOut });

    let stop = false;

    collector.on('collect', m => {
        const str = m.content.toLowerCase();
        
        if (str.includes('no')) {
            recipient.send("aww");
            stop = true;
            collector.stop();
            return;
        }
        if (str.includes('yes')) {
            recipient.send("Yay!");
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