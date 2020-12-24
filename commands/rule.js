const rand = require('../lib/randomFunctions.js');
const axios = require('axios');
const parseString = require('xml2js').parseString;
const { rule } = require('../config.json');

module.exports = {
    name: 'rule',
    fileName: __filename,
    description: 'send rule pics',
    args: true,
    usage: '<tags_w/_spaces_need_underscores>',
    cooldown: 1,
    async execute(msg, args) {
        // tags are separated by '+'
        const tags = args.join('+');

        // the max number of pages for the api is 2000
        let pid = rand.randomMath(2001);
        let url = `${rule}${tags}&pid=`;

        try {
            let response = await axios.get(`${url}${pid}`);
            let XMLStr = response.data;

            let postCount = 0;
            let postArr = [];
            parseString(XMLStr, (err, result) => {
                // obj's are named '$'
                // 'count' is # of images for the tags provided
                postCount = parseInt(result.posts['$'].count);
                postArr = result.posts.post;
            });

            if (postCount === 0) {
                msg.channel.send('Aww there\'s no results 😢');
                return;
            }

            if (typeof postArr === 'undefined') {
                // the site has a max of 100 posts per request
                pid = rand.randomMath(~~(postCount / 100) + 1);

                response = await axios.get(`${url}${pid}`);
                XMLStr = response.data;

                parseString(XMLStr, (err, result) => {
                    postArr = result.posts.post;
                });
            }

            const randIndex = rand.randomMath(postArr.length);
            const img = postArr[randIndex]['$'];

            msg.channel.send(img.file_url);
            msg.channel.send(`Results: ${postCount}`);
        }
        catch (error) {
            console.log(error);
        }
    }
}