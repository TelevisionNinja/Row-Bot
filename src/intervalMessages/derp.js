import { getImage } from '../commands/derp.js';
import config from '../../config/config.json' assert { type: 'json' };
import { setDailyInterval } from 'daily-intervals';
import { createImgResult } from '../lib/msgUtils.js';
import { getChannel } from '../lib/discordUtils.js';
import { randomInteger } from '../lib/randomFunctions.js';
import { cutOff } from '../lib/stringUtils.js';

const derpConfig = config.derp,
    noResultsMsg = config.noResultsMsg;

const filter = derpConfig.filterTags.map(t => `-${t}`);

async function retryUntilResult() {
    const randIndex = randomInteger(derpConfig.intervalTags.length);
    const selection = derpConfig.intervalTags[randIndex];
    const tagArr = [selection, 'safe', 'solo', 'score.gte:500', ...filter];
    const img = await getImage(tagArr);

    if (img.results) {
        img.title = `${derpConfig.intervalMsg}${selection}`;

        return createImgResult(img, false);
    }

    return retryUntilResult();
}

// posts a daily derp image
export async function execute(client) {
    const recipientDaily = await getChannel(client, derpConfig.intervalChannelID);

    setDailyInterval(
        async () => recipientDaily.send(await retryUntilResult()),
        1440, // 24 hrs in minutes
        derpConfig.intervalTime
    );

    //-------------------------------------------------------------------

    const recipientInterval = await getChannel(client, derpConfig.intervalWaitChannelID);

    setDailyInterval(
        async () => {
            const randIndex = randomInteger(derpConfig.intervalWaitTags.length);
            const selection = derpConfig.intervalWaitTags[randIndex];
            const tagArr = [selection, 'score.gte:500', ...filter];
            const img = await getImage(tagArr);

            if (img.results) {
                recipientInterval.send(createImgResult(img, false));
            }
            else {
                recipientInterval.send(cutOff(`${noResultsMsg}\nTags:\n\`${tagArr}\``));
            }
        },
        derpConfig.intervalWait
    );
}
