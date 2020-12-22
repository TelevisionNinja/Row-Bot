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
        const url = rule + args.join('+');

        try {
            const response = await axios.get(url);
            const XMLStr = response.data;

            let postArr = [];
            parseString(XMLStr, (err, result) => {
                postArr = result.posts.post;
            });

            if (typeof postArr === 'undefined') {
                msg.channel.send('Aww there\'s no results 😢');
                return;
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