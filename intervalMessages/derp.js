import { getImage } from '../commands/derp.js';
import { default as config } from '../config.json';
import DailyInterval from 'daily-intervals';
import {
    getRecipient,
    sendImg
} from '../lib/msgUtils.js';
import { randomMath } from '../lib/randomFunctions.js';

const derpConfig = config.derp;

const filter = derpConfig.filterTags.map(t => `-${t}`);

export default {
    description: derpConfig.description,
    async execute(client) {
        const recipientDaily = await getRecipient(client, derpConfig.intervalChannelID);

        const interval1 = new DailyInterval(
            async () => {
                const randIndex = randomMath(derpConfig.intervalTags.length);
                const selection = derpConfig.intervalTags[randIndex];
                const tagArr = [selection, 'safe', 'solo', 'score.gte:100', ...filter];
                const img = await getImage(tagArr);

                img.title = `${derpConfig.intervalMsg}${selection}`;

                sendImg(recipientDaily, img, false);
            },
            derpConfig.intervalTime,
            1440, // 24 hrs in minutes
            5000 // 5 second offset
        );

        //-------------------------------------------------------------------

        const recipientInterval = await getRecipient(client, derpConfig.intervalWaitChannelID);

        const interval2 = new DailyInterval(
            async () => {
                const randIndex = randomMath(derpConfig.intervalWaitTags.length);
                const selection = derpConfig.intervalWaitTags[randIndex];
                const tagArr = [selection, 'score.gte:25', ...filter];
                const img = await getImage(tagArr);

                sendImg(recipientInterval, img, false);
            },
            '0:0',
            derpConfig.intervalWait,
            5000 // 5 second offset
        );

        //-------------------------------------------------------------------

        interval1.start();
        interval2.start();
    }
}