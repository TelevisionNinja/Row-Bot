const { fifty } = require('../config.json');
const axios = require('axios');
const rand = require('../lib/randomFunctions.js');
const stringUtils = require('../lib/stringUtils.js');

module.exports = {
    names: fifty.names,
    description: fifty.description,
    args: false,
    permittedCharsOnly: false,
    guildOnly: false,
    usage: '',
    cooldown: 1,
    async execute(msg, args) {
        const {
            title,
            link
        } = await getRandomFifty();

        msg.channel.send([title, `<${link}>`]);
    },
    getRandomFifty
}

async function getRandomFifty() {
    let title = '';
    let link = '';

    try {
        const response = await axios.get(fifty.URL);
        const postArr = response.data.data.children;

        // the first post is usually a post about rules, so index 0 is unused
        const post = postArr[rand.randomMath(1, postArr.length)];

        title = post.data.title;
        link = post.data.url;

        link = stringUtils.replaceHTMLEntities(link);
    }
    catch (error) {
        console.log(error);
    }

    return {
        title,
        link
    }
}