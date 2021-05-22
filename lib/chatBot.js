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
            const response = await axios.get(`${config.chatbotAPI}&message=${msg}&user=${userID}`);
            const results = response.data;
            reply = results.message
                .replaceAll(/\b(chat robot)\b/ig, 'pony')
                .replaceAll(/\b(chat bot)\b/ig, 'pony')
                .replaceAll(/\b(chatbot)\b/ig, 'pony')
                .replaceAll(/\b(robots?)\b/ig, 'pony')
                .replaceAll(/\b(male)\b/ig, 'female');
        }
        catch (error) {
            backOff(error, queue);
        }
    });

    return reply;
}