const rule = require('../commands/rule.js');
const { rule: ruleConfig } = require('../config.json');
const interval = require('../lib/interval.js');
const msgUtils = require('../lib/msgUtils.js');
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

                const tagArr = [selection, ...filter];

                const {
                    img,
                    source,
                    count
                } = await rule.getRuleImage(tagArr);
                
                msgUtils.sendImg(recipient, img, source, count, false);
            },
            ruleConfig.intervalWait,
            0,
            0,
            true
        );
    }
}