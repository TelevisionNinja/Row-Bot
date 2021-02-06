const interval = require('../lib/interval.js');
const msgUtils = require('../lib/msgUtils.js');
const { memes } = require('../config.json');
const axios = require('axios');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    description: memes.description,
    async execute(client) {
        const recipient = await msgUtils.getRecipient(client, memes.channelID);

        interval.startIntervalFunc(
            async () => {
                try {
                    const URL = memes.URLs[rand.randomMath(memes.URLs.length)];
                    const response = await axios.get(URL);
                    const postArr = response.data.data.children;

                    const post = postArr[rand.randomMath(postArr.length)];

                    recipient.send(encodeURI(post.data.url));
                }
                catch (error) {
                    console.log(error);
                }
            },
            180,
            0,
            0
        );
    }
}