import { getImage } from '../commands/derp.js';
import config from '../../config/config.json' with { type: 'json' };
import { setDailyInterval } from 'daily-intervals';
import { createImgResult } from '../lib/msgUtils.js';
import { getChannel } from '../lib/discordUtils.js';
import { randomInteger } from '../lib/randomFunctions.js';
import { cutOff } from '../lib/stringUtils.js';

const derpConfig = config.derp,
    noResultsMsg = config.noResultsMsg;

const filter = derpConfig.filterTags.map(t => `-${t}`);

let dontPostDaily = true;
let dontPostRule = true;

export function channelIsActiveDaily() {
    dontPostDaily = false;
}
export function channelIsActiveRule() {
    dontPostRule = false;
}

async function retryUntilResult() {
    const randIndex = randomInteger(derpConfig.intervalTags.length);
    const selection = derpConfig.intervalTags[randIndex];
    const tagArr = [selection, 'safe', 'solo', 'score.gte:200', ...filter];
    const img = await getImage(tagArr);

    if (img.results) {
        img.title = `${derpConfig.intervalMsg}${selection}`;

        return createImgResult(img, false);
    }

    return retryUntilResult();
}

export async function execute(client) {
    const recipientDaily = await getChannel(client, derpConfig.intervalChannelID);

    // posts a daily derp image
    setDailyInterval(
        async () => {
            if (dontPostDaily) {
                return;
            }

            dontPostDaily = true;

            recipientDaily.send(await retryUntilResult());
        },
        1440, // 24 hrs in minutes
        derpConfig.intervalTime
    );

    //-------------------------------------------------------------------

    const recipientInterval = await getChannel(client, derpConfig.intervalWaitChannelID);

    setDailyInterval(
        async () => {
            if (dontPostRule) {
                return;
            }

            dontPostRule = true;

            const randIndex = randomInteger(derpConfig.intervalWaitTags.length);
            const selection = derpConfig.intervalWaitTags[randIndex];
            const tagArr = [selection, 'score.gte:350', ...filter];
            const img = await getImage(tagArr);

            if (img.results) {
                recipientInterval.send(createImgResult(img, false));
            }
            else {
                recipientInterval.send(cutOff(`${noResultsMsg}\nTags:\n\`${tagArr}\``));
            }
        },
        60 * 24,
        '12:0'
    );

    setDailyInterval(
        async () => {
            if (dontPostRule) {
                return;
            }

            dontPostRule = true;

            const randIndex = randomInteger(derpConfig.intervalWaitTags.length);
            const selection = derpConfig.intervalWaitTags[randIndex];
            const tagArr = [selection, 'score.gte:350', ...filter];
            const img = await getImage(tagArr);

            if (img.results) {
                recipientInterval.send(createImgResult(img, false));
            }
            else {
                recipientInterval.send(cutOff(`${noResultsMsg}\nTags:\n\`${tagArr}\``));
            }
        },
        60 * 12,
        '6:0'
    );
}
