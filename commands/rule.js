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
        const tags = args.join('+');
        let url = `${rule}&tags=${tags}`;

        try {
            let response = await axios.get(url);
            let XMLStr = response.data;

            let postCount = 0;
            parseString(XMLStr, (err, result) => {
                postCount = parseInt(result.posts['$'].count);
            });

            if (postCount === 0) {
                msg.channel.send('Aww there\'s no results 😢');
                return;
            }

            postCount = ~~(postCount / 100);
            let pageMax = 2000;

            if (postCount < pageMax) {
                pageMax = postCount;
            }

            const pid = rand.randomMath(pageMax + 1);
            url = `${url}&pid=${pid}`;

            response = await axios.get(url);
            XMLStr = response.data;

            let postArr = [];
            parseString(XMLStr, (err, result) => {
                postArr = result.posts.post;
            });

            const randIndex = rand.randomMath(postArr.length);
            const img = postArr[randIndex]['$'];

            msg.channel.send(img.file_url);
        }
        catch (error) {
            console.log(error);
        }
    }
}