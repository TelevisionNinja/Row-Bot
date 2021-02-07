const rule = require('../commands/rule.js');
const { rule: ruleConfig } = require('../config.json');
const interval = require('../lib/interval.js');
const msgUtils = require('../lib/msgUtils.js');
const stringUtils = require('../lib/stringUtils.js');
const rand = require('../lib/randomFunctions.js');

const filter = ruleConfig.filterTags.map(t => `-${t}`);

module.exports = {
    description: ruleConfig.description,
    async execute(client) {
        const recipient = await msgUtils.getRecipient(client, ruleConfig.intervalChannelID);

        interval.startIntervalFunc(
            async () => {
                const randIndex = rand.randomMath(ruleConfig.intervalTags.length);

                const selection = ruleConfig.intervalTags[randIndex];

                let tagArr = [selection, ...filter];

                tagArr = stringUtils.tagArrToParsedTagArr(tagArr, ruleConfig.whitespace);

                const {
                    imgURL,
                    source,
                    results
                } = await rule.getImageRule0(tagArr);

                msgUtils.sendImg(recipient, imgURL, source, results, false);
            },
            ruleConfig.intervalWait,
            0,
            0
        );
    }
}