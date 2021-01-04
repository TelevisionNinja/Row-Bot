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
    async execute(client) {
        const time = askLateNight.time.split(':').map(i => parseInt(i));

        const recipient = await msgUtils.getRecipient(client, askLateNight.channelID);

        interval.startIntervalFunc(
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
            1440, // 24 hrs in minutes
            time[0],
            time[1],
            true
        );
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
        return aliases.some(a => str.includes(a));
    }, { time: timeOut });

    collector.on('collect', m => {
        const userID = m.author.id;

        const memberObj = memberMap.get(userID);
        
        if (memberObj.user.decision !== undecided) {
            return;
        }

        const str = m.content.toLowerCase();
        const wordArr = str.split(' ');
        const initial = numberOfReplies;
        let reply = '';

        if (wordArr.includes('no')) {
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
        else if (wordArr.includes('yes')) {
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

        if (initial !== numberOfReplies) {
            msgUtils.sendTypingMsg(recipient, reply, str);

            sendDms(memberMap, askingMsg, denied);
        }

        if (numberOfReplies === memberSize) {
            collector.stop();
        }
    });

    collector.on('end', () => {
        if (!numberOfReplies) {
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

function sendDms(memberMap, askingMsg, denied) {
    const reply = buildMessage(memberMap, askingMsg);

    memberMap.forEach((value, key) => {
        const userObj = value.user;

        if (userObj.decision !== denied) {
            msgUtils.sendDirectDm(userObj, reply, true);
        }
    });
}