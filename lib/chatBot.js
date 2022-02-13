import PQueue from 'p-queue';
import { backOff } from './urlUtils.js';
import config from '../config.json' assert { type: 'json' };

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

/**
 * 
 * @param {*} userID 
 * @param {*} msg 
 * @returns 
 */
export async function getChatBotReply(userID, msg) {
    let reply = '';

    await queue.add(async () => {
        const response = await fetch(`${config.chatbotAPI}${userID}&msg=${encodeURIComponent(msg)}`);

        if (backOff(response, queue)) {
            return;
        }

        try {
            reply = (await response.json()).cnt;
        }
        catch (error) {
            console.log(error);
        }
    });

    return reply;
}
