import config from '../config.json' assert { type: 'json' };
import messages from '../messages.json' assert { type: 'json' };
import { randomMath } from '../lib/randomFunctions.js';
import DailyInterval from 'daily-intervals';
import {
    getChannel,
    sendDirectDm,
    hasBotMention,
    sendTypingMsg
} from '../lib/msgUtils.js';
import { includesPhrase } from '../lib/stringUtils.js';

const askLateNight = config.askLateNight,
    prefix = config.prefix,
    acknowledgements = messages.acknowledgements,
    yeses = messages.yeses,
    nos = messages.nos;

let asked = false;

// ask the late night bois if they're going to get on
export async function execute(client) {
    const channel = await getChannel(client, askLateNight.channelID);

    const interval = new DailyInterval(
        () => {
            ask(
                channel,
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

async function ask(channel, timeOut, askingMsg, allConfirmsMsg, fewConfirmsMsg, noReplyMsg, confirmed, undecided, denied) {
    if (asked) {
        return;
    }

    asked = true;

    await channel.guild.members.fetch();

    const memberMap = channel.members.filter((value, key) => !value.user.bot);
    memberMap.forEach((value, key) => value.user.decision = undecided);
    const memberSize = memberMap.size;

    let numberOfReplies = 0;
    let numberOfDenies = 0;
    let numberOfConfirms = 0;

    await sendTypingMsg(channel, {
        content: askingMsg
    }, '');

    const collector = channel.createMessageCollector({
        filter: m => {
            return !m.author.bot && !m.content.startsWith(prefix) && hasBotMention(m, false, true, false, true, true).mentioned;
        },
        time: timeOut
    });

    collector.on('collect', m => {
        const userID = m.author.id;

        const memberObj = memberMap.get(userID);
        
        if (typeof memberObj === 'undefined' || memberObj.user.decision !== undecided) {
            return;
        }

        const str = m.content;
        const initial = numberOfReplies;
        let reply = '';

        if (yeses.some(y => includesPhrase(str, y, false))) {
            numberOfConfirms++;

            if (numberOfConfirms === memberSize) {
                reply = allConfirmsMsg;
            }
            else {
                reply = acknowledgements[randomMath(acknowledgements.length)];
            }

            memberObj.user.decision = confirmed;

            numberOfReplies++;
        }
        else if (nos.some(n => includesPhrase(str, n, false))) {
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
            sendTypingMsg(channel, {
                content: reply
            }, str);

            sendDms(memberMap, askingMsg, denied, str);
        }

        if (numberOfReplies === memberSize) {
            collector.stop();
        }
    });

    collector.on('end', () => {
        asked = false;

        if (!numberOfReplies || !numberOfConfirms) {
            sendTypingMsg(channel, {
                content: noReplyMsg
            }, '');
        }
        else if (numberOfReplies < memberSize) {
            sendTypingMsg(channel, {
                content: fewConfirmsMsg
            }, '');
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
            sendDirectDm(userObj, {
                content: reply
            }, true, readingMsg);
        }
    });
}
