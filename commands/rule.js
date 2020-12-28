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
    description: 'Returns a rule pic',
    args: true,
    guildOnly: false,
    usage: '<tags separated by commas>',
    cooldown: 1,
    async execute(msg, args) {
        const {
            img,
            source,
            count
        } = await rule(args);

        if (count) {
            msg.channel.send(img);
            msg.channel.send(`Source: <${source}>\nResults: ${count}`);
        }
        else {
            msg.channel.send('Aww there\'s no results 😢');
        }
    }
}

/**
 * Returns an image from one of the rule sites, a source url, and the number of results.
 * If no image is found, the count var is returned as zero.
 * 
 * @param {*} tagArr array of tags to be searched
 */
async function rule(tagArr) {
    // tags are separated by '+'
    const tags = [...new Set(tagArr.join('_').split(',').map(t => t.replace(/^_+|_+$/g, '')))];

    const url0 = `${ruleURLs[0].api}${tags.join('+')}&pid=`;

    // this api has a max of 3 tags
    const url1 = `${ruleURLs[1].api}${tags.slice(0, 3).join('+')}&pid=`;

    const urlArr = [url0, url1];

    // the max number of pages for rule0 api is 2000 (0-2000)
    // the max number of pages for rule1 api is 1999 (0-1999)

    let randomSiteID = rand.randomMath(2);
    let url = urlArr[randomSiteID];
    let pid = 2000 - randomSiteID;

    const {
        imgURL,
        imgID,
        results
    } = await getImage(url, pid, randomSiteID);

    let img = imgURL;
    let id = imgID;
    let count = results;

    if (!results) {
        // this cycles between the number of sites (2)
        randomSiteID = ++randomSiteID % 2;

        url = urlArr[randomSiteID];
        pid = 2000 - randomSiteID;
        
        const {
            imgURL,
            imgID,
            results
        } = await getImage(url, pid, randomSiteID);

        img = imgURL;
        id = imgID;
        count = results;
    }

    return {
        img,
        source: `${ruleURLs[randomSiteID].url}${id}`,
        count,
    }
}

/**
 * Returns an image, the image id, and the number of results.
 * If no image is found, the results var is returned as zero.
 * 
 * @param {*} url url w/ tags already appended
 * @param {*} pidMax maximum number of pages
 * @param {*} siteID which site
 */
async function getImage(url, pidMax, siteID) {
    let pid = rand.randomMath(pidMax + 1);

    let imgURL = '';
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
            if (siteID) { // site 1
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
                    if (siteID) { // site 1
                        postArr = result.posts['tag'];
                    }
                    else { // site 0
                        postArr = result.posts.post;
                    }
                });
            }

            const randIndex = rand.randomMath(postArr.length);
            const img = postArr[randIndex]['$'];

            imgURL = img.file_url;
            imgID = img.id;
        }
    }
    catch (error) {
        console.log(error);
    }

    return {
        imgURL,
        imgID,
        results
    };
}