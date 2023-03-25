import PQueue from 'p-queue';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { Readable } from 'stream';

const queue = new PQueue({
    timeout: 1000 * 60 * 15, // raspberry pi 4 takes about a maximum of 10 mins to generate the response using the 7B model
    concurrency: 1 // raspberry pi 4 cant handle more than 1 instance
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
            reply = await new Promise((resolve, reject) => {
                msg = msg.replaceAll('\n', '\\');
                const stdin = Readable.from([msg]);
                const chat = execFile(`${directory}chat`, [directory], (error, stdout, stderr) => {
                    if (error !== null) {
                        reject(error);
                        return;
                    }

                    resolve(stdout);
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
