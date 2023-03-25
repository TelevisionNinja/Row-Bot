import PQueue from 'p-queue';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { Readable } from 'stream';

const timeout = 1000 * 60 * 15; // raspberry pi 4 takes about a maximum of 10 mins to generate the response using the 7B model
const maxBufferSize = 2000 * 4; // discord character limit is 2000. utf8 can be a max of 4 bytes

const queue = new PQueue({
    timeout: timeout,
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
    let reply = 'The prompt timed out or encountered an error';

    await queue.add(async () => {
        try {
            reply = await new Promise((resolve, reject) => {
                msg = msg.replaceAll('\n', '\\');
                const stdin = Readable.from([msg]);
                const chat = execFile(`${directory}chat`, [directory], {
                    timeout: timeout,
                    encoding: 'utf8',
                    maxBuffer: maxBufferSize
                }, (error, stdout, stderr) => {
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
