import { getImageRule0 } from '../commands/rule.js';
import { default as config } from '../config.json';
import DailyInterval from 'daily-intervals';
import {
    getRecipient,
    sendImg
} from '../lib/msgUtils.js';
import { tagArrToParsedTagArr } from '../lib/stringUtils.js';
import { randomMath } from '../lib/randomFunctions.js';

const ruleConfig = config.rule;

const filter = ruleConfig.filterTags.map(t => `-${t}`);

export default {
    description: ruleConfig.description,
    async execute(client) {
        const recipient = await getRecipient(client, ruleConfig.intervalChannelID);

        const interval = new DailyInterval(
            async () => {
                const randIndex = randomMath(ruleConfig.intervalTags.length);
                const selection = ruleConfig.intervalTags[randIndex];
                let tagArr = [selection, ...filter];

                tagArr = tagArrToParsedTagArr(tagArr, ruleConfig.whitespace);

                const img = await getImageRule0(tagArr);

                sendImg(recipient, img, false);
            },
            '0:0',
            ruleConfig.intervalWait,
            5000 // 5 second offset
        );

        interval.start();
    }
}