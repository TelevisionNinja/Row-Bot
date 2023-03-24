import PQueue from 'p-queue';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { Readable } from 'stream';

const queue = new PQueue({
    interval: 1000 * 60 * 5, // raspberry pi 4 takes about a maximum of 10 mins to generate the response using the 7B model
    intervalCap: 1 // raspberry pi 4 cant handle more than 1 instance
});

const directory = `${dirname(fileURLToPath(import.meta.url))}/ai/`;

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
            await new Promise((resolve, reject) => {
                msg = msg.replaceAll('\n', '\\');
                const stdin = Readable.from([msg]);
                const chat = spawn(directory + 'chat', [directory]);

                chat.stderr.on('error', error => reject(error));
                chat.stdout.on('error', error => reject(error));
                chat.stdin.on('error', error => reject(error));
                chat.on('error', error => reject(error));

                chat.stdout.on('data', output => {
                    reply = `${reply}${output.toString()} `;
                });
                chat.stdout.on('close', () => {
                    reply = reply.substring(0, reply.length - 1);
                    resolve(reply);
                });

                stdin.pipe(chat.stdin);
            });
        }
        catch (error) {
            console.log(error);
        }
    });

    return reply;
}
