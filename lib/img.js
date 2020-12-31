module.exports = {
    sendImg
}

/**
 * sends an image
 * 
 * @param {*} client 
 * @param {*} imgURL 
 * @param {*} source 
 * @param {*} results 
 * @param {*} sendResults 
 */
async function sendImg(client, imgURL, source, results, sendResults = true) {
    if (results) {
        client.send(imgURL);
        if (sendResults) {
            client.send(`Source: <${source}>\nResults: ${results}`);
        }
        else {
            client.send(`Source: <${source}>`);
        }
    }
    else {
        client.send('Aww there\'s no results 😢');
    }
}