import { getImageRule0 } from '../commands/rule.js';
import config from '../../config/config.json' assert { type: 'json' };
import { setDailyInterval } from 'daily-intervals';
import {
    getChannel,
    createImgResult
} from '../lib/msgUtils.js';
import { randomMath } from '../lib/randomFunctions.js';
import { cutOff } from '../lib/stringUtils.js';

const ruleConfig = config.rule,
    noResultsMsg = config.noResultsMsg;

const filter = ruleConfig.filterTags.map(t => `-${t}`);

// posts a daily rule image
export async function execute(client) {
    const recipient = await getChannel(client, ruleConfig.intervalChannelID);

    setDailyInterval(
        async () => {
            const randIndex = randomMath(ruleConfig.intervalTags.length);
            const selection = ruleConfig.intervalTags[randIndex];
            const tagArr = [selection, ...filter];

            const img = await getImageRule0(tagArr);

            if (img.results) {
                recipient.send(createImgResult(img, false));
            }
            else {
                recipient.send(cutOff(`${noResultsMsg}\nTags:\n\`${tagArr}\``, 2000));
            }
        },
        ruleConfig.intervalWait
    );
}
