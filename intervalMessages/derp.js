const derp = require('../commands/derp.js');
const { derp: derpConfig } = require('../config.json');
const interval = require('../lib/interval.js');
const sendMsg = require('../lib/msgUtils.js');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: derpConfig.description,
    async execute(client) {
        const time = derpConfig.intervalTime.split(':').map(i => parseInt(i));

        interval.executeIntervalFunc(
            async () => {
                const recipient = await sendMsg.getRecipient(client, derpConfig.intervalChannelID);

                // map was used bc tagArr was the exact same array taht was being used for every interval
                let tagArr = derpConfig.intervalTagArr.map(t => `-${t}`);

                const randIndex = rand.randomMath(tagArr.length);

                tagArr[randIndex] = tagArr[randIndex].substring(1);
                tagArr.push('safe');
                tagArr.push('-oc');
                tagArr.push('-crossover');

                const {
                    imgURL,
                    source,
                    results
                } = await derp.getImage(tagArr);

                recipient.send(`${derpConfig.intervalMsg}${derpConfig.intervalTagArr[randIndex]}`);

                sendMsg.sendImg(recipient, imgURL, source, results, false);
            },
            1440, // 24 hrs in minutes
            time[0],
            time[1]
        );

        //-------------------------------------------------------------------

        interval.executeIntervalFunc(
            async () => {
                const recipient = await sendMsg.getRecipient(client, derpConfig.intervalWaitChannelID);

                const randIndex = rand.randomMath(derpConfig.intervalWaitTags.length);

                const {
                    imgURL,
                    source,
                    results
                } = await derp.getImage(derpConfig.intervalWaitTags[randIndex]);
                
                sendMsg.sendImg(recipient, imgURL, source, results, false);
            },
            derpConfig.intervalWait,
            0,
            0
        );
    }
}