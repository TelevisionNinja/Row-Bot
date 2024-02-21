import PQueue from 'p-queue';
import { cutOff } from './stringUtils.js';

const timeout = 1000 * 60 * 8; // 8 mins
const model = 'tinyllama';

const queue = new PQueue({
    timeout: timeout,
    concurrency: 1 // raspberry pi 4 cant handle more than 1 instance
});

// pull the model
fetch('http://localhost:11434/api/pull', {
    method: 'POST',
    body: JSON.stringify({
        name: model,
        stream: false,
        insecure: false
    })
});

/**
 * 
 * @param {*} userID 
 * @param {*} msg 
 * @returns 
 */
export async function getChatBotReply(userID, msg) {
    let reply = 'An error occurred';

    await queue.add(async () => {
        try {
            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                body: JSON.stringify({
                    model: model,
                    stream: false,
                    messages: [
                        {
                            role: 'user',
                            content: msg
                        }
                    ]
                })
            });

            const data = await response.json();
            reply = data.message.content;
            reply = cutOff(reply);
        }
        catch (error) {
            console.log(error);
        }
    });

    return reply;
}
