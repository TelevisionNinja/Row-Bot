const derp = require('../commands/derp.js');
const {
    derp: derpConfig,
    tagSeparator
} = require('../config.json');
const interval = require('../lib/interval.js');
const sendMsg = require('../lib/msgUtils.js');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: derpConfig.description,
    async execute(client) {
        const time = derpConfig.intervalTime.split(':').map(i => parseInt(i));

        interval.execute24HrIntervalFunc(
            async () => {
                const recipient = await sendMsg.getRecipient(client, derpConfig.intervalChannelID);

                let tagArr = derpConfig.intervalTagArr.map(t => `-${t}${tagSeparator}`);
                const randIndex = rand.randomMath(tagArr.length);

                recipient.send(`${derpConfig.intervalMsg}: ${derpConfig.intervalTagArr[randIndex]}`);

                tagArr[randIndex] = tagArr[randIndex].substring(1);
                tagArr.push(`safe${tagSeparator}`);
                tagArr.push('-oc');

                const {
                    imgURL,
                    source,
                    results
                } = await derp.getImage(tagArr);
                
                sendMsg.sendImg(recipient, imgURL, source, results, false);
            },
            time[0],
            time[1]
        );

        interval.executeIntervalFunc(
            async () => {
                const recipient = await sendMsg.getRecipient(client, derpConfig.intervalWaitChannelID);

                const randIndex = rand.randomMath(derpConfig.intervalWaitTags.length);

                const tagArr = derpConfig.intervalWaitTags[randIndex]
                    .map(t => `${t}${tagSeparator}`)
                    .push('');

                const {
                    imgURL,
                    source,
                    results
                } = await derp.getImage(tagArr);
                
                sendMsg.sendImg(recipient, imgURL, source, results, false);
            },
            derpConfig.intervalWait,
            0,
            0
        );
    }
}