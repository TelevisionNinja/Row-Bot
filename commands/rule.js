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
        let pid = rand.randomMath(2001);
        let url = `${rule}${tags}&pid=`;

        try {
            let response = await axios.get(`${url}${pid}`);
            let XMLStr = response.data;

            let postCount = 0;
            let postArr = [];
            parseString(XMLStr, (err, result) => {
                postCount = parseInt(result.posts['$'].count);
                postArr = result.posts.post;
            });

            if (postCount === 0) {
                msg.channel.send('Aww there\'s no results 😢');
                return;
            }

            if (typeof postArr === 'undefined') {
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
        }
        catch (error) {
            console.log(error);
        }
    }
}