const rand = require('../lib/randomFunctions.js');
const stringUtil = require('../lib/stringUtils.js');
const axios = require('axios');
const parseString = require('xml2js').parseString;
const {
    rule,
    tagSeparator
} = require('../config.json');

module.exports = {
    names: rule.names,
    fileName: __filename,
    description: rule.description,
    args: true,
    guildOnly: false,
    usage: `<tags separated by a "${tagSeparator}">`,
    cooldown: 1,
    async execute(msg, args) {
        const {
            img,
            source,
            count
        } = await getRuleImage(args);

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
async function getRuleImage(tagArr) {
    // whitespace is replaced with '_'
    // tags are separated by '+'
    tagArr = [
        ...new Set(
            tagArr
            .join(rule.whitespace)
            .split(tagSeparator)
            .map(t => stringUtil.trim(t, rule.whitespace))
            )
        ];

    const url0 = `${rule.sites[0].API}${tagArr.join(rule.separator)}&pid=`;

    // this api has a max of 3 tags
    const url1 = `${rule.sites[1].API}${tagArr.slice(0, 3).join(rule.separator)}&pid=`;

    const urlArr = [url0, url1];

    // the max number of images for the rule0 api is 200001 images (0-200000)
    // the max number of images for the rule1 api is 200000 (0-199999)

    // (max # images) / (limit per resquest) = pid max
    // ex: 200001 / 100 = a pid max of 2000 bc it starts at 0

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
        source: `${rule.sites[randomSiteID].URL}${id}`,
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