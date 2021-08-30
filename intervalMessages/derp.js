import { getImage } from '../commands/derp.js';
import { default as config } from '../config.json';
import DailyInterval from 'daily-intervals';
import {
    getChannel,
    sendImg
} from '../lib/msgUtils.js';
import { randomMath } from '../lib/randomFunctions.js';

const derpConfig = config.derp,
    noResultsMsg = config.noResultsMsg;

const filter = derpConfig.filterTags.map(t => `-${t}`);

// posts a daily derp image
export async function execute(client) {
    const recipientDaily = await getChannel(client, derpConfig.intervalChannelID);

    const interval1 = new DailyInterval(
        async () => {
            const randIndex = randomMath(derpConfig.intervalTags.length);
            const selection = derpConfig.intervalTags[randIndex];
            const tagArr = [selection, 'safe', 'solo', 'score.gte:25', ...filter];
            const img = await getImage(tagArr);

            img.title = `${derpConfig.intervalMsg}${selection}`;

            if (img.results) {
                sendImg(recipientDaily, img, false);
            }
            else {
                recipientDaily.send(`${noResultsMsg}\nTags:\n\`${tagArr}\``);
            }
        },
        derpConfig.intervalTime,
        1440, // 24 hrs in minutes
        5000 // 5 second offset
    );

    //-------------------------------------------------------------------

    const recipientInterval = await getChannel(client, derpConfig.intervalWaitChannelID);

    const interval2 = new DailyInterval(
        async () => {
            const randIndex = randomMath(derpConfig.intervalWaitTags.length);
            const selection = derpConfig.intervalWaitTags[randIndex];
            const tagArr = [selection, 'score.gte:400', ...filter];
            const img = await getImage(tagArr);

            if (img.results) {
                sendImg(recipientInterval, img, false);
            }
            else {
                recipientInterval.send(`${noResultsMsg}\nTags:\n\`${tagArr}\``);
            }
        },
        '0:0',
        derpConfig.intervalWait,
        5000 // 5 second offset
    );

    //-------------------------------------------------------------------

    interval1.start();
    interval2.start();
}
