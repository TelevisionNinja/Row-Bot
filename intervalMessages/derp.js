const derp = require('../commands/derp.js');
const {
    derp: derpConfig,
    tagSeparator
} = require('../config.json');
const interval = require('../lib/interval.js');
const sendImg = require('../lib/img.js');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: derpConfig.description,
    async execute(client) {
        let receiver;

        if (derpConfig.intervalIsDM) {
            receiver = await client.users.fetch(derpConfig.intervalChannelID);
        }
        else {
            receiver = client.channels.cache.get(derpConfig.intervalChannelID);
        }

        const time = derpConfig.intervalTime.split(':').map(i => parseInt(i));

        interval.executeIntervalFunc(
            async () => {
                let tagArr = derpConfig.intervalTagArr.map(t => `-${t}${tagSeparator}`);
                const randIndex = rand.randomMath(tagArr.length);

                receiver.send(`${derpConfig.intervalMsg}: ${derpConfig.intervalTagArr[randIndex]}`);

                tagArr[randIndex] = tagArr[randIndex].substring(1);
                tagArr.push("safe");

                const {
                    imgURL,
                    source,
                    results
                } = await derp.getImage(tagArr);
                
                sendImg.sendImg(receiver, imgURL, source, results, false);
            },
            derpConfig.intervalWait,
            time[0],
            time[1]
        );
    }
}

