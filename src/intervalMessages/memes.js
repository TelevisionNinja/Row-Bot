import { setDailyInterval } from 'daily-intervals';
import { getChannel } from '../lib/discordUtils.js';
import config from '../../config/config.json' assert { type: 'json' };
import { getMeme } from '../lib/meme.js';

const memes = config.memes;

// posts a daily meme
export async function execute(client) {
    const recipient = await getChannel(client, memes.channelID);

    setDailyInterval(
        async () => {
            const meme = await getMeme();

            if (meme.length) {
                recipient.send(meme);
            }
        },
        360
    );
}
