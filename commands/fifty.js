const { fifty } = require('../config.json');
const axios = require('axios');
const rand = require('../lib/randomFunctions.js');

module.exports = {
    names: fifty.names,
    fileName: __filename,
    description: fifty.description,
    args: false,
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

        const post = postArr[rand.randomMath(postArr.length)];

        title = post.data.title;
        link = post.data.url;
    }
    catch (error) {
        console.log(error);
    }

    return {
        title,
        link
    }
}