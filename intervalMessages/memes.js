const interval = require('../lib/interval.js');
const msgUtils = require('../lib/msgUtils.js');
const { memes } = require('../config.json');
const axios = require('axios');
const rand = require('../lib/randomFunctions.js');
const stringUtils = require('../lib/stringUtils.js');

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

                    // the first post is usually a post about rules, so index 0 is unused
                    const post = postArr[rand.randomMath(1, postArr.length)];

                    recipient.send(stringUtils.replaceHTMLEntities(post.data.url));
                }
                catch (error) {
                    console.log(error);
                }
            },
            180,
            0,
            0,
            true
        );
    }
}