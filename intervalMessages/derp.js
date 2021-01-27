const derp = require('../commands/derp.js');
const { derp: derpConfig } = require('../config.json');
const interval = require('../lib/interval.js');
const msgUtils = require('../lib/msgUtils.js');
const rand = require('../lib/randomFunctions.js');

const filter = derpConfig.filterTags.map(t => `-${t}`);

module.exports = {
    description: derpConfig.description,
    async execute(client) {
        const time = derpConfig.intervalTime.split(':').map(i => parseInt(i));

        const recipientDaily = await msgUtils.getRecipient(client, derpConfig.intervalChannelID);

        interval.startIntervalFunc(
            async () => {
                const randIndex = rand.randomMath(derpConfig.intervalTags.length);

                const selection = derpConfig.intervalTags[randIndex];

                let tagArr = [selection, ...filter];
                tagArr.push('safe');
                tagArr.push('solo');

                const {
                    imgURL,
                    source,
                    results
                } = await derp.getImage(tagArr);

                recipientDaily.send(`${derpConfig.intervalMsg}${selection}`);

                msgUtils.sendImg(recipientDaily, imgURL, source, results, false);
            },
            1440, // 24 hrs in minutes
            time[0],
            time[1],
            true
        );

        //-------------------------------------------------------------------

        const recipientInterval = await msgUtils.getRecipient(client, derpConfig.intervalWaitChannelID);

        interval.startIntervalFunc(
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
            derpConfig.intervalWait,
            0,
            0,
            true
        );
    }
}