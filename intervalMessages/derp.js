const derp = require('../commands/derp.js');
const { derp: derpConfig } = require('../config.json');
const DailyInterval = require('daily-intervals');
const msgUtils = require('../lib/msgUtils.js');
const rand = require('../lib/randomFunctions.js');

const filter = derpConfig.filterTags.map(t => `-${t}`);

module.exports = {
    description: derpConfig.description,
    async execute(client) {
        const recipientDaily = await msgUtils.getRecipient(client, derpConfig.intervalChannelID);

        const interval1 = new DailyInterval(
            async () => {
                const randIndex = rand.randomMath(derpConfig.intervalTags.length);

                const selection = derpConfig.intervalTags[randIndex];

                const tagArr = [selection, 'safe', 'solo', ...filter];

                const {
                    imgURL,
                    source,
                    results
                } = await derp.getImage(tagArr);

                recipientDaily.send(`${derpConfig.intervalMsg}${selection}`);

                msgUtils.sendImg(recipientDaily, imgURL, source, results, false);
            },
            derpConfig.intervalTime,
            1440, // 24 hrs in minutes
            5000 // 5 second offset
        );

        //-------------------------------------------------------------------

        const recipientInterval = await msgUtils.getRecipient(client, derpConfig.intervalWaitChannelID);

        const interval2 = new DailyInterval(
            async () => {
                const randIndex = rand.randomMath(derpConfig.intervalWaitTags.length);

                const selection = derpConfig.intervalWaitTags[randIndex];

                const tagArr = [selection, ...filter];

                const {
                    imgURL,
                    source,
                    results
                } = await derp.getImage(tagArr);
                
                msgUtils.sendImg(recipientInterval, imgURL, source, results, false);
            },
            '0:0',
            derpConfig.intervalWait,
            5000 // 5 second offset
        );

        //-------------------------------------------------------------------

        interval1.start();
        interval2.start();
    }
}