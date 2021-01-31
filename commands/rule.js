const rand = require('../lib/randomFunctions.js');
const msgUtils = require('../lib/msgUtils.js');
const stringUtils = require('../lib/stringUtils.js');
const axios = require('axios');
const parseString = require('xml2js').parseString;
const {
    rule,
    tagSeparator
} = require('../config.json');

module.exports = {
    names: rule.names,
    description: rule.description,
    args: true,
    permittedCharsOnly: true,
    guildOnly: false,
    usage: `<tags separated by a "${tagSeparator}">`,
    cooldown: 1,
    async execute(msg, args) {
        args = args.join(' ').split(tagSeparator);

        const {
            img,
            source,
            count
        } = await getRuleImage(args);

        msgUtils.sendImg(msg.channel, img, source, count);
    },
    getRuleImage,
    getImageRule0,
    getImageRule1
}

/**
 * Returns an image, the image id, and the number of results.
 * If no image is found, the results var is returned as zero.
 * 
 * 2 requests are made
 * 
 * @param {*} tagArr array of tags that are already formatted
 */
async function getImageRule0(tagArr) {
    const URL = `${rule.sites[0].API}${tagArr.join(rule.separator)}&limit=`;

    let imgURL = '';
    let source = '';
    let results = 0;

    try {
        let response = await axios.get(`${URL}0`);
        let XMLStr = response.data;

        parseString(XMLStr, (err, result) => {
            // obj's are named '$'
            // 'count' is # of images for the provided tags
            results = parseInt(result.posts['$'].count);
        });

        if (results) {
            // the max number of images for the rule0 api is 200001 images (0-200000)
            // the site has a max of 100 posts per request
            // pid range: zero to count / (limit per request)

            // (max # images) / (limit per request) = pid max
            // ex: 200001 / 100 = a pid max of 2000 bc it starts at 0
            if (results > 200000) {
                results = 200000;
            }
            const pid = rand.randomMath(results);

            response = await axios.get(`${URL}1&pid=${pid}`);
            XMLStr = response.data;
            let img;

            parseString(XMLStr, (err, result) => {
                // array of posts is named 'post'
                img = result.posts.post[0]['$'];
            });

            imgURL = img.file_url;
            source = `${rule.sites[0].URL}${img.id}`;
        }
    }
    catch (error) {
        console.log(error);
    }

    return {
        imgURL,
        source,
        results
    };
}

/**
 * Returns an image, the image id, and the number of results.
 * If no image is found, the results var is returned as zero.
 * 
 * 2 requests are made
 * 
 * @param {*} tagArr array of tags that are already formatted
 */
async function getImageRule1(tagArr) {
    // this api has a max of 3 tags
    const URL = `${rule.sites[1].API}${tagArr.slice(0, 3).join(rule.separator)}&limit=`;

    let imgURL = '';
    let source = '';
    let results = 0;

    try {
        let response = await axios.get(`${URL}0`);
        let XMLStr = response.data;

        parseString(XMLStr, (err, result) => {
            // obj's are named '$'
            // 'count' is # of images for the provided tags
            results = parseInt(result.posts['$'].count);
        });

        if (results) {
            // the site has a max of 100 posts per request
            // pid range: zero to count / (limit per request)

            // (max # images) / (limit per request) = pid max
            // ex: 200001 / 100 = a pid max of 2000 bc it starts at 0
            const pid = rand.randomMath(results);

            response = await axios.get(`${URL}1&pid=${pid}`);
            XMLStr = response.data;
            let img;

            parseString(XMLStr, (err, result) => {
                // array of posts is named 'tag'
                img = result.posts.tag[0]['$'];
            });

            imgURL = img.file_url;
            source = `${rule.sites[1].URL}${img.id}`;
        }
    }
    catch (error) {
        console.log(error);
    }

    return {
        imgURL,
        source,
        results
    };
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
    // '-' infront of a tag means to exclude it
    tagArr = stringUtils.tagArrToParsedTagArr(tagArr, rule.whitespace);

    let randomSiteID = rand.randomMath(2);

    let img = '';
    let source = '';
    let count = 0;

    let requestedImg;

    if (randomSiteID) {
        requestedImg = await getImageRule1(tagArr);
    }
    else {
        requestedImg = await getImageRule0(tagArr);
    }

    count = requestedImg.results;

    if (!count) {
        // this cycles between the number of sites (2)
        randomSiteID = ++randomSiteID % 2;
        
        if (randomSiteID) {
            requestedImg = await getImageRule1(tagArr);
        }
        else {
            requestedImg = await getImageRule0(tagArr);
        }
    
        img = requestedImg.imgURL;
        source = requestedImg.source;
        count = requestedImg.results;
    }
    else {
        img = requestedImg.imgURL;
        source = requestedImg.source;
    }

    return {
        img,
        source,
        count,
    };
}