const { askLateNight } = require('../config.json');
const interval = require('../lib/interval.js');

module.exports = {
    description: askLateNight.description,
    execute(client) {
        const time = askLateNight.time.split(':');

        interval.execute24HrIntervalFunc(
            () => {
                ask(
                    client,
                    askLateNight.channelID,
                    askLateNight.isDM,
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

async function ask(client, ID, isDM, msg, noReplayMsg, timeOut) {
    let receiver;

    if (isDM) {
        receiver = await client.users.fetch(ID);
    }
    else {
        receiver = client.channels.cache.get(ID);
    }

    receiver.send(msg);

    const collector = receiver.createMessageCollector(m => m, { time: timeOut });

    let stop = false;

    collector.on('collect', m => {
        const str = m.content.toLowerCase();
        
        if (str.includes('no')) {
            receiver.send("aww");
            stop = true;
            collector.stop();
            return;
        }
        if (str.includes('yes')) {
            receiver.send("Yay!");
            stop = true;
            collector.stop();
            return;
        }
    });

    collector.on('end', () => {
        if (!stop) {
            receiver.send(noReplayMsg);
        }
    });
}