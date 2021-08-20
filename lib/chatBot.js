import PQueue from 'p-queue';
import axios from 'axios';
import { backOff } from './limit.js';
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
        try {
            const response = await axios.get(`${config.chatbotAPI}${userID}&msg=${encodeURIComponent(msg)}`);
            const result = response.data;

            reply = result.cnt;
        }
        catch (error) {
            if (typeof error.response !== 'undefined') {
                backOff(error, queue);
            }
        }
    });

    return reply;
}
