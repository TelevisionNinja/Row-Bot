import PQueue from 'p-queue';
import { cutOff } from './stringUtils.js';
import { Agent } from 'undici';
import config from '../../config/config.json' with { type: 'json' };

const ollamaConfig = config.ollama;

const timeout = 1000 * 60 * 8; // 8 mins
const model = 'llama3.2:1b';

const queue = new PQueue({
    timeout: timeout,
    concurrency: 3 * 4 // 3 models for CPU inference, 4 parallel requests for each model
});

const address = `http://${ollamaConfig.host}:${ollamaConfig.port}/api/`; // use ipv4 instead of localhost bc ollama doesnt work w/ ipv6

// pull the model
fetch(`${address}pull`, {
    method: 'POST',
    body: JSON.stringify({
        model: model,
        stream: false,
        insecure: false
    }),
    dispatcher: new Agent({ headersTimeout: 1000 * 60 * 60 }) // 1 hour
});

/**
 * 
 * @param {*} username 
 * @param {*} msg 
 * @returns 
 */
export async function getChatBotReply(username, msg) {
    let reply = 'An error occurred';

    await queue.add(async () => {
        try {
            const response = await fetch(`${address}chat`, {
                method: 'POST',
                body: JSON.stringify({
                    model: model,
                    stream: false,
                    messages: [
                        {
                            role: 'system',
                            content: `You are Pinkie Pie, the character from My Little Pony: Friendship is Magic. You are having a conversation with another person named ${username}`
                        },
                        {
                            role: 'user',
                            content: 'What\'s your name?'
                        },
                        {
                            role: 'assistant',
                            content: `My name is Pinkie Pie!`
                        },
                        {
                            role: 'user',
                            content: 'What\'s my name?'
                        },
                        {
                            role: 'assistant',
                            content: `Your name is ${username}!`
                        },
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
