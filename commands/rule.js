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
    fileName: __filename,
    description: rule.description,
    args: true,
    permittedCharsOnly: true,
    guildOnly: false,
    usage: `<tags separated by a "${tagSeparator}">`,
    cooldown: 1,
    async execute(msg, args) {
        const {
            img,
            source,
            count
        } = await getRuleImageExecute(args);

        msgUtils.sendImg(msg.channel, img, source, count);
    },
    getRuleImage
}

/**
 * Returns an image from one of the rule sites, a source url, and the number of results.
 * If no image is found, the count var is returned as zero.
 * 
 * @param {*} tagArr array of tags to be searched
 */
async function getRuleImageExecute(tagArr) {
    // whitespace is replaced with '_'
    // tags are separated by '+'
    // '-' infront of a tag means to exclude it
    tagArr = stringUtils.tagsToParsedTagArr(tagArr, rule.whitespace);

    let randomSiteID = rand.randomMath(2);

    let img = '';
    let id = '';
    let count = 0;

    let requestedImg;

    if (randomSiteID) {
        requestedImg = await getImageRule1(tagArr);
    }
    else {
        requestedImg = await getImageRule0(tagArr);
    }

    img = requestedImg.imgURL;
    id = requestedImg.imgID;
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
        id = requestedImg.imgID;
        count = requestedImg.results;
    }

    return {
        img,
        source: `${rule.sites[randomSiteID].URL}${id}`,
        count,
    };
}

/**
 * Returns an image, the image id, and the number of results.
 * If no image is found, the results var is returned as zero.
 * 
 * Best case: 1 request
 * Worst case: 2 requests
 * 
 * @param {*} tagArr array of tags that are already formatted
 */
async function getImageRule0(tagArr) {
    const URL = `${rule.sites[0].API}${tagArr.join(rule.separator)}&pid=`;

    // the max number of images for the rule0 api is 200001 images (0-200000)
    let pid = rand.randomMath(200001);

    let imgURL = '';
    let imgID = '';
    let results = 0;

    try {
        let response = await axios.get(`${URL}${pid}`);
        let XMLStr = response.data;
        let postArr = [];

        parseString(XMLStr, (err, result) => {
            // obj's are named '$'
            // 'count' is # of images for the provided tags
            results = parseInt(result.posts['$'].count);

            // array of posts is named 'post'
            postArr = result.posts.post;
        });

        if (results) {
            if (typeof postArr === 'undefined') {
                // the site has a max of 100 posts per request
                // pid range: zero to count / (limit per request)

                // (max # images) / (limit per request) = pid max
                // ex: 200001 / 100 = a pid max of 2000 bc it starts at 0
                // pid max is exclusive unless results > 200000
                // the limit per request is set to 1 in this implementation
                pid = rand.randomMath(results);

                response = await axios.get(`${URL}${pid}`);
                XMLStr = response.data;

                parseString(XMLStr, (err, result) => {
                    postArr = result.posts.post;
                });
            }

            const img = postArr[0]['$'];
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

/**
 * Returns an image, the image id, and the number of results.
 * If no image is found, the results var is returned as zero.
 * 
 * Best case: 1 request
 * Worst case: 2 requests
 * 
 * @param {*} tagArr array of tags that are already formatted
 */
async function getImageRule1(tagArr) {
    // this api has a max of 3 tags
    const URL = `${rule.sites[1].API}${tagArr.slice(0, 3).join(rule.separator)}`;

    let imgURL = '';
    let imgID = '';
    let results = 0;

    try {
        let response = await axios.get(URL);
        let XMLStr = response.data;
        let postArr = [];

        parseString(XMLStr, (err, result) => {
            // obj's are named '$'
            // 'count' is # of images for the provided tags
            results = parseInt(result.posts['$'].count);

            // array of posts is named 'tag'
            postArr = result.posts.tag;
        });

        if (results) {
            // the site has a max of 100 posts per request
            // pid range: zero to count / (limit per request)

            // (max # images) / (limit per request) = pid max
            // ex: 200001 / 100 = a pid max of 2000 bc it starts at 0 meaning pid max is exclusive
            // the limit per request is set to 1 in this implementation
            pid = rand.randomMath(results);

            if (pid !== 0) {
                response = await axios.get(`${URL}&pid=${pid}`);
                XMLStr = response.data;

                parseString(XMLStr, (err, result) => {
                    postArr = result.posts.tag;
                });
            }

            const img = postArr[0]['$'];
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

//----------------------------------------------------------------------

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
    let id = '';
    let count = 0;

    let requestedImg;

    if (randomSiteID) {
        requestedImg = await getImageRule1(tagArr);
    }
    else {
        requestedImg = await getImageRule0(tagArr);
    }

    img = requestedImg.imgURL;
    id = requestedImg.imgID;
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
        id = requestedImg.imgID;
        count = requestedImg.results;
    }

    return {
        img,
        source: `${rule.sites[randomSiteID].URL}${id}`,
        count,
    };
}