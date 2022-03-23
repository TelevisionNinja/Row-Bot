import { getImage } from '../commands/derp.js';
import config from '../../config/config.json' assert { type: 'json' };
import { setDailyInterval } from 'daily-intervals';
import {
    getChannel,
    createImgResult
} from '../lib/msgUtils.js';
import { randomMath } from '../lib/randomFunctions.js';
import { cutOff } from '../lib/stringUtils.js';

const derpConfig = config.derp,
    noResultsMsg = config.noResultsMsg;

const filter = derpConfig.filterTags.map(t => `-${t}`);

// posts a daily derp image
export async function execute(client) {
    const recipientDaily = await getChannel(client, derpConfig.intervalChannelID);

    setDailyInterval(
        async () => {
            const randIndex = randomMath(derpConfig.intervalTags.length);
            const selection = derpConfig.intervalTags[randIndex];
            const tagArr = [selection, 'safe', 'solo', 'score.gte:25', ...filter];
            const img = await getImage(tagArr);

            img.title = `${derpConfig.intervalMsg}${selection}`;

            if (img.results) {
                recipientDaily.send(createImgResult(img, false));
            }
            else {
                recipientDaily.send(cutOff(`${noResultsMsg}\nTags:\n\`${tagArr}\``, 2000));
            }
        },
        1440, // 24 hrs in minutes
        derpConfig.intervalTime
    );

    //-------------------------------------------------------------------

    const recipientInterval = await getChannel(client, derpConfig.intervalWaitChannelID);

    setDailyInterval(
        async () => {
            const randIndex = randomMath(derpConfig.intervalWaitTags.length);
            const selection = derpConfig.intervalWaitTags[randIndex];
            const tagArr = [selection, 'score.gte:450', ...filter];
            const img = await getImage(tagArr);

            if (img.results) {
                recipientInterval.send(createImgResult(img, false));
            }
            else {
                recipientInterval.send(cutOff(`${noResultsMsg}\nTags:\n\`${tagArr}\``, 2000));
            }
        },
        derpConfig.intervalWait
    );
}
