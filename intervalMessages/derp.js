const derp = require('../commands/derp.js');
const { derp: derpConfig } = require('../config.json');
const interval = require('../lib/interval.js');
const msgUtils = require('../lib/msgUtils.js');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: derpConfig.description,
    async execute(client) {
        const time = derpConfig.intervalTime.split(':').map(i => parseInt(i));

        const recipientDaily = await msgUtils.getRecipient(client, derpConfig.intervalChannelID);

        interval.startIntervalFunc(
            async () => {
                let tagArr = [];

                const randIndex = rand.randomMath(derpConfig.intervalTagArr.length);

                const selection = derpConfig.intervalTagArr[randIndex];

                tagArr.push(selection);
                tagArr.push('safe');
                tagArr.push('solo');
                tagArr.push('-oc');
                tagArr.push('-crossover');
                tagArr.push('-cosplay');
                tagArr.push('-irl');
                tagArr.push('-irl human');

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

                const {
                    imgURL,
                    source,
                    results
                } = await derp.getImage(derpConfig.intervalWaitTags[randIndex]);
                
                msgUtils.sendImg(recipientInterval, imgURL, source, results, false);
            },
            derpConfig.intervalWait,
            0,
            0,
            true
        );
    }
}