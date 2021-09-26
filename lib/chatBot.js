import PQueue from 'p-queue';
import fetch from 'node-fetch';
import { backOff } from './urlUtils.js';
import { default as config } from '../config.json';

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

        reply = (await response.json()).cnt;
    });

    return reply;
}
