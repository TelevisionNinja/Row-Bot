import PQueue from 'p-queue';
import { cutOff } from './stringUtils.js';
import { Agent } from 'undici';

const timeout = 1000 * 60 * 8; // 8 mins
const model = 'tinyllama';

const queue = new PQueue({
    timeout: timeout,
    concurrency: 3 * 4 // 3 models for CPU inference, 4 parallel requests for each model
});

// pull the model
fetch('http://localhost:11434/api/pull', {
    method: 'POST',
    body: JSON.stringify({
        name: model,
        stream: false,
        insecure: false
    }),
    dispatcher: new Agent({ headersTimeout: 1000 * 60 * 60 }) // 1 hour
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
                }),
                dispatcher: new Agent({ headersTimeout: timeout })
            });

            const data = await response.json();

            if (typeof data.message !== 'undefined') {
                reply = data.message.content;
                reply = cutOff(reply);
            }
        }
        catch (error) {
            console.log(error);
        }
    });

    return reply;
}
