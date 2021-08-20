import { getImageRule0 } from '../commands/rule.js';
import { default as config } from '../config.json';
import DailyInterval from 'daily-intervals';
import {
    getRecipient,
    sendImg
} from '../lib/msgUtils.js';
import { tagArrToParsedTagArr } from '../lib/stringUtils.js';
import { randomMath } from '../lib/randomFunctions.js';

const ruleConfig = config.rule,
    noResultsMsg = config.noResultsMsg;

const filter = ruleConfig.filterTags.map(t => `-${t}`);

// posts a daily rule image
export async function execute(client) {
    const recipient = await getRecipient(client, ruleConfig.intervalChannelID);

    const interval = new DailyInterval(
        async () => {
            const randIndex = randomMath(ruleConfig.intervalTags.length);
            const selection = ruleConfig.intervalTags[randIndex];
            let tagArr = [selection, ...filter];

            tagArr = tagArrToParsedTagArr(tagArr, ruleConfig.whitespace);

            const img = await getImageRule0(tagArr);

            if (img.results) {
                sendImg(recipient, img, false);
            }
            else {
                recipient.send(`${noResultsMsg}\nTags:\n\`${tagArr}\``);
            }
        },
        '0:0',
        ruleConfig.intervalWait,
        5000 // 5 second offset
    );

    interval.start();
}
