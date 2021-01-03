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

async function ask(recipient, timeOut) {
    await recipient.guild.members.fetch();

    const memberMap = recipient.members.filter(m => !(m.user.bot));
    memberMap.forEach(m => m.user.decision = askLateNight.undecided);
    const memberSize = memberMap.size;

    let numberOfReplies = 0;

    await msgUtils.sendTypingMsg(recipient, askLateNight.msg, '');

    const collector = recipient.createMessageCollector(m => {
        const str = m.content.toLowerCase();
        return aliases.some(a => str.includes(a));
    }, { time: timeOut });

    collector.on('collect', m => {
        const userID = m.author.id;
        const memberObj = memberMap.get(userID);
        
        if (memberObj.user.decision !== askLateNight.undecided) {
            return;
        }

        const str = m.content.toLowerCase();
        const wordArr = str.split(' ');
        const initial = numberOfReplies;

        if (wordArr.includes('no')) {
            msgUtils.sendTypingMsg(recipient, 'aww', str);

            memberObj.user.decision = askLateNight.denied;

            numberOfReplies++;
        }
        
        if (wordArr.includes('yes')) {
            msgUtils.sendTypingMsg(recipient, acknowledgements[rand.randomMath(acknowledgements.length)], str);

            memberObj.user.decision = askLateNight.confirmed;

            numberOfReplies++;
        }

        if (initial !== numberOfReplies) {
            memberMap.delete(userID);
            memberMap.set(userID, memberObj);

            sendDms(memberMap);
        }

        if (numberOfReplies === memberSize) {
            collector.stop();
        }
    });

    collector.on('end', () => {
        if (!numberOfReplies) {
            msgUtils.sendTypingMsg(recipient, askLateNight.noReplyMsg, '');
        }
    });
}

function buildMessage(memberMap, titleMsg) {
    let msg = `${titleMsg}\n\n`;

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

function sendDms(memberMap) {
    const reply = buildMessage(memberMap, askLateNight.msg);

    memberMap.forEach((value, key) => {
        const userObj = value.user;

        if (userObj.decision !== askLateNight.denied) {
            msgUtils.sendDirectDm(userObj, reply, true);
        }
    });
}