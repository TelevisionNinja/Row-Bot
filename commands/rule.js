const rand = require('../lib/randomFunctions.js');
const axios = require('axios');
const parseString = require('xml2js').parseString;
const {
    rule0,
    rule1
} = require('../config.json');

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

        const url1 = `${rule0}${tags}&pid=`;
        const url2 = `${rule1}${tags}&pid=`;

        // the max number of pages for rule0 api is 2000 (0-2000)
        const { imgURL: img1, results: results1 } = await getImage(url1, 2000, 0);

        // the max number of pages for rule1 api is 1999 (0-1999)
        const { imgURL: img2, results: results2 } = await getImage(url2, 1999, 1);

        let finalImg = img1;
        let finalResults = results1;
        let source = rule0;

        if (results1) {
            if (results2) {
                if (rand.randomMath(2)) {
                    finalImg = img2;
                    finalResults = results2;
                    source = rule1;
                }
            }
        }
        else {
            if (results2) {
                finalImg = img2;
                finalResults = results2;
                source = rule1;
            }
            else {
                msg.channel.send(img1);
                return;
            }
        }

        source = source.split('/')[2];

        msg.channel.send(finalImg);
        msg.channel.send(`From: ${source}\nResults: ${finalResults}`);
    }
}

async function getImage(url, pidMax, source) {
    let pid = rand.randomMath(pidMax + 1);

    let imgURL = '';
    let results = 0;

    try {
        let response = await axios.get(`${url}${pid}`);
        let XMLStr = response.data;

        let postArr = [];
        parseString(XMLStr, (err, result) => {
            // obj's are named '$'
            // 'count' is # of images for the tags provided
            results = parseInt(result.posts['$'].count);

            // array of posts is named 'post' or 'tag' depending on the site
            if (source === 0) {
                postArr = result.posts.post;
            }
            else if (source === 1) {
                postArr = result.posts['tag'];
            }
        });

        if (results === 0) {
            imgURL = 'Aww there\'s no results 😢';
        }
        else {
            if (typeof postArr === 'undefined') {
                // the sites have a max of 100 posts per request
                pid = rand.randomMath(~~(results / 100) + 1);

                response = await axios.get(`${url}${pid}`);
                XMLStr = response.data;

                parseString(XMLStr, (err, result) => {
                    if (source === 0) {
                        postArr = result.posts.post;
                    }
                    else if (source === 1) {
                        postArr = result.posts['tag'];
                    }
                });
            }

            const randIndex = rand.randomMath(postArr.length);
            const img = postArr[randIndex]['$'];

            imgURL = img.file_url;
        }
    }
    catch (error) {
        console.log(error);
    }

    return {
        imgURL,
        results
    };
}