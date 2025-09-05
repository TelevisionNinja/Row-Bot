import { getImageRule0 } from '../commands/rule.js';
import config from '../../config/config.json' with { type: 'json' };
import { setDailyInterval } from 'daily-intervals';
import { createImgResult } from '../lib/msgUtils.js';
import { getChannel } from '../lib/discordUtils.js';
import { randomInteger } from '../lib/randomFunctions.js';
import { cutOff } from '../lib/stringUtils.js';

const ruleConfig = config.rule,
    noResultsMsg = config.noResultsMsg;

const filter = ruleConfig.filterTags.map(t => `-${t}`);

let dontPost = true;

export function channelIsActive() {
    dontPost = false;
}

// posts a daily rule image
export async function execute(client) {
    const recipient = await getChannel(client, ruleConfig.intervalChannelID);

    setDailyInterval(
        async () => {
            if (dontPost) {
                return;
            }

            dontPost = true;

            const randIndex = randomInteger(ruleConfig.intervalTags.length);
            const selection = ruleConfig.intervalTags[randIndex];
            const tagArr = [selection, ...filter];
            const img = await getImageRule0(tagArr);

            if (img.results) {
                recipient.send(createImgResult(img, false));
            }
            else {
                const result = cutOff(`${noResultsMsg}\nTags:\n\`${tagArr}\``);
                // recipient.send(result);
                console.log(result);
            }
        },
        60 * 24,
        '12:0'
    );

    setDailyInterval(
        async () => {
            if (dontPost) {
                return;
            }

            dontPost = true;

            const randIndex = randomInteger(ruleConfig.intervalTags.length);
            const selection = ruleConfig.intervalTags[randIndex];
            const tagArr = [selection, ...filter];
            const img = await getImageRule0(tagArr);

            if (img.results) {
                recipient.send(createImgResult(img, false));
            }
            else {
                const result = cutOff(`${noResultsMsg}\nTags:\n\`${tagArr}\``);
                // recipient.send(result);
                console.log(result);
            }
        },
        60 * 12,
        '6:0'
    );
}
