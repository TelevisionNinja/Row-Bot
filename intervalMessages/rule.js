import { getImageRule0 } from '../commands/rule.js';
import config from '../config.json' assert { type: 'json' };
import DailyInterval from 'daily-intervals';
import {
    getChannel,
    sendImg
} from '../lib/msgUtils.js';
import { tagArrToParsedTagArr } from '../lib/stringUtils.js';
import { randomMath } from '../lib/randomFunctions.js';
import { cutOff } from '../lib/stringUtils.js';

const ruleConfig = config.rule,
    noResultsMsg = config.noResultsMsg;

const filter = ruleConfig.filterTags.map(t => `-${t}`);

// posts a daily rule image
export async function execute(client) {
    const recipient = await getChannel(client, ruleConfig.intervalChannelID);

    const interval = new DailyInterval(
        async () => {
            const randIndex = randomMath(ruleConfig.intervalTags.length);
            const selection = ruleConfig.intervalTags[randIndex];
            let tagArr = [selection, ...filter];

            tagArr = tagArrToParsedTagArr(tagArr, ruleConfig.sites[0].whitespace);

            const img = await getImageRule0(tagArr);

            if (img.results) {
                sendImg(recipient, img, false);
            }
            else {
                recipient.send(cutOff(`${noResultsMsg}\nTags:\n\`${tagArr}\``, 2000));
            }
        },
        '0:0',
        ruleConfig.intervalWait,
        5000 // 5 second offset
    );

    interval.start();
}
