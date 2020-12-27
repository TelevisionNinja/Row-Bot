const rand = require('../lib/randomFunctions.js');
const axios = require('axios');
const parseString = require('xml2js').parseString;
const {
    ruleURLs,
    ruleAliases
} = require('../config.json');

module.exports = {
    name: 'rule',
    aliases: ruleAliases,
    fileName: __filename,
    description: 'Send a rule pic',
    args: true,
    guildOnly: false,
    usage: '<tags separated by commas>',
    cooldown: 1,
    async execute(msg, args) {
        // tags are separated by '+'
        const tags = args.join('_').split(',').map(t => t.replace(/^_+|_+$/g, ''));

        const url0 = `${ruleURLs[0].api}${tags.join('+')}&pid=`;

        // this api has a max of 3 tags
        const url1 = `${ruleURLs[1].api}${tags.slice(0, 3).join('+')}&pid=`;

        const urlArr = [url0, url1];

        // the max number of pages for rule0 api is 2000 (0-2000)
        // the max number of pages for rule1 api is 1999 (0-1999)

        let randomSiteID = rand.randomMath(2);
        let url = urlArr[randomSiteID];
        let pid = 2000 - randomSiteID;

        const { imgID, results } = await getImage(url, pid, randomSiteID);

        let id = imgID;
        let count = results;

        if (!results) {
            // this cycles between the number of sites (2)
            randomSiteID = ++randomSiteID % 2;

            url = urlArr[randomSiteID];
            pid = 2000 - randomSiteID;
            
            const { imgID, results } = await getImage(url, pid, randomSiteID);

            if (!results) {
                msg.channel.send('Aww there\'s no results 😢');
                return;
            }

            id = imgID;
            count = results;
        }

        msg.channel.send(`${ruleURLs[randomSiteID].url}${id}`);
        msg.channel.send(`Results: ${count}`);
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

    let imgID = 0;
    let results = 0;

    try {
        let response = await axios.get(`${url}${pid}`);
        let XMLStr = response.data;

        let postArr = [];
        parseString(XMLStr, (err, result) => {
            // obj's are named '$'
            // 'count' is # of images for the provided tags
            results = parseInt(result.posts['$'].count);

            // array of posts is named 'post' or 'tag' depending on the site
            if (sourceID) { // site 1
                postArr = result.posts['tag'];
            }
            else { // site 0
                postArr = result.posts.post;
            }
        });

        if (results) {
            if (typeof postArr === 'undefined') {
                // the sites have a max of 100 posts per request
                // pid range: zero to count / (posts per page)
                pid = rand.randomMath(~~(results / 100) + 1);

                response = await axios.get(`${url}${pid}`);
                XMLStr = response.data;

                parseString(XMLStr, (err, result) => {
                    if (sourceID) { // site 1
                        postArr = result.posts['tag'];
                    }
                    else { // site 0
                        postArr = result.posts.post;
                    }
                });
            }

            const randIndex = rand.randomMath(postArr.length);
            const img = postArr[randIndex]['$'];

            imgID = img.id;
        }
    }
    catch (error) {
        console.log(error);
    }

    return {
        imgID,
        results
    };
}