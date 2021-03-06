const { fifty } = require('../config.json');
const axios = require('axios');
const stringUtils = require('../lib/stringUtils.js');

module.exports = {
    names: fifty.names,
    description: fifty.description,
    argsRequired: false,
    argsOptional: false,
    permittedCharsOnly: false,
    guildOnly: false,
    usage: '',
    cooldown: 1,
    async execute(msg, args) {
        const {
            title,
            link
        } = await getRandomFifty();

        msg.channel.send(`${title}\n<${link}>`);
    },
    getRandomFifty
}

async function getRandomFifty() {
    let title = '';
    let link = '';

    try {
        const response = await axios.get(fifty.URL);
        const post = response.data[0].data.children[0].data;

        title = post.title;
        link = stringUtils.replaceHTMLEntities(post.url);
    }
    catch (error) {
        console.log(error);
    }

    return {
        title,
        link
    }
}