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
    usage: '<tags separated by commas>',
    cooldown: 1,
    async execute(msg, args) {
        // tags are separated by '+'
        const tags = args.join('_').split(',_').join('+');

        const url0 = `${rule0}${tags}&pid=`;
        const url1 = `${rule1}${tags}&pid=`;

        // the max number of pages for rule0 api is 2000 (0-2000)
        // the max number of pages for rule1 api is 1999 (0-1999)

        let randomSiteID = rand.randomMath(2);
        let url = url0;
        let pid = 2000;

        if (randomSiteID) {
            url = url1;
            pid = 1999;
        }

        const { imgURL, results } = await getImage(url, pid, randomSiteID);

        let img = imgURL;
        let count = results;

        if (!results) {
            // this cycles between the number of sites (2)
            randomSiteID = ++randomSiteID % 2;

            if (randomSiteID) {
                url = url1;
                pid = 1999;
            }
            else {
                url = url0;
                pid = 2000;
            }
            
            const { imgURL, results } = await getImage(url, pid, randomSiteID);

            if (!results) {
                msg.channel.send('Aww there\'s no results 😢');
                return;
            }

            img = imgURL;
            count = results;
        }

        url = url.split('/')[2];

        msg.channel.send(img);
        msg.channel.send(`From: ${url}\nResults: ${count}`);
    }
}

/**
 * returns an image url & number of results if there are any results
 * 
 * default return is an empty string and zero for the results
 * 
 * @param {*} url url w/ tags already appended
 * @param {*} pidMax maximum number of pages
 * @param {*} sourceID source id
 */
async function getImage(url, pidMax, sourceID) {
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
            if (sourceID) { // site 0
                postArr = result.posts['tag'];
            }
            else { // site 1
                postArr = result.posts.post;
            }
        });

        if (results) {
            if (typeof postArr === 'undefined') {
                // the sites have a max of 100 posts per request
                pid = rand.randomMath(~~(results / 100) + 1);

                response = await axios.get(`${url}${pid}`);
                XMLStr = response.data;

                parseString(XMLStr, (err, result) => {
                    if (sourceID) { // site 0
                        postArr = result.posts['tag'];
                    }
                    else { // site 1
                        postArr = result.posts.post;
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