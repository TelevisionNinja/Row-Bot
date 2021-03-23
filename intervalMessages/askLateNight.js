const {
    names,
    askLateNight,
    prefix
} = require('../config.json');
const {
    acknowledgements,
    yeses,
    nos
} = require('../messages.json');
const rand = require('../lib/randomFunctions.js');
const DailyInterval = require('daily-intervals');
const msgUtils = require('../lib/msgUtils.js');

module.exports = {
    description: askLateNight.description,
    async execute(client) {
        const recipient = await msgUtils.getRecipient(client, askLateNight.channelID);

        const interval = new DailyInterval(
            () => {
                ask(
                    recipient,
                    askLateNight.timeOut, // time out is in ms
                    askLateNight.msg,
                    askLateNight.allConfirmsMsg,
                    askLateNight.fewConfirmsMsg,
                    askLateNight.noReplyMsg,
                    askLateNight.confirmed,
                    askLateNight.undecided,
                    askLateNight.denied
                );
            },
            askLateNight.time,
            1440, // 24 hrs in minutes
            5000 // 5 second offset
        );

        interval.start();
    }
}

async function ask(recipient, timeOut, askingMsg, allConfirmsMsg, fewConfirmsMsg, noReplyMsg, confirmed, undecided, denied) {
    await recipient.guild.members.fetch();

    const memberMap = recipient.members.filter((value, key) => !(value.user.bot));
    memberMap.forEach((value, key) => value.user.decision = undecided);
    const memberSize = memberMap.size;

    let numberOfReplies = 0;
    let numberOfDenies = 0;
    let numberOfConfirms = 0;

    await msgUtils.sendTypingMsg(recipient, askingMsg, '');

    const collector = recipient.createMessageCollector(m => {
        const str = m.content.toLowerCase();
        return !(str.startsWith(prefix)) && !(m.author.bot) && (names.some(a => str.includes(a.toLowerCase())) || msgUtils.hasBotMention(m, false, true, false));
    }, { time: timeOut });

    collector.on('collect', m => {
        const userID = m.author.id;

        const memberObj = memberMap.get(userID);
        
        if (memberObj.user.decision !== undecided) {
            return;
        }

        const str = m.content.toLowerCase().replaceAll('\n', ' ');
        const wordArr = str.split(' ');
        const initial = numberOfReplies;
        let reply = '';

        if (yeses.some(y => wordArr.includes(y.toLowerCase()))) {
            numberOfConfirms++;

            if (numberOfConfirms === memberSize) {
                reply = allConfirmsMsg;
            }
            else {
                reply = acknowledgements[rand.randomMath(acknowledgements.length)];
            }

            memberObj.user.decision = confirmed;

            numberOfReplies++;
        }
        else if (nos.some(n => wordArr.includes(n.toLowerCase()))) {
            numberOfDenies++;

            if (numberOfDenies === memberSize) {
                reply = noReplyMsg;
            }
            else {
                reply = 'aww';
            }

            memberObj.user.decision = denied;

            numberOfReplies++;
        }

        if (initial !== numberOfReplies) {
            msgUtils.sendTypingMsg(recipient, reply, str);

            sendDms(memberMap, askingMsg, denied, str);
        }

        if (numberOfReplies === memberSize) {
            collector.stop();
        }
    });

    collector.on('end', () => {
        if (!numberOfReplies || !numberOfConfirms) {
            msgUtils.sendTypingMsg(recipient, noReplyMsg, '');
        }
        else if (numberOfReplies < memberSize) {
            msgUtils.sendTypingMsg(recipient, fewConfirmsMsg, '');
        }
    });
}

function buildMessage(memberMap, askingMsg) {
    let msg = `${askingMsg}\n\n`;

    memberMap.forEach((value, key) => {
        msg = `${msg}${value.user.decision} `;

        if (value.nickname === null) {
            msg = `${msg}${value.user.username}\n`;
        }
        else {
            msg = `${msg}${value.nickname}\n`;
        }
    });

    return msg.substring(0, msg.length - 1);
}

function sendDms(memberMap, askingMsg, denied, readingMsg) {
    const reply = buildMessage(memberMap, askingMsg);

    memberMap.forEach((value, key) => {
        const userObj = value.user;

        if (userObj.decision !== denied) {
            msgUtils.sendDirectDm(userObj, reply, true, readingMsg);
        }
    });
}