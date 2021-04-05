const { deleteTulp } = require('./tulpConfig.json');
const { tulp: tulpConfig } = require('../../config.json');
const { tulp: tulpCollection } = require('../../lib/database.js');

module.exports = {
    names: deleteTulp.names,
    description: deleteTulp.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: '<name>',
    async execute(msg, args) {
        const tulpName = args.join(' ').trim();
        const query = { _id: msg.author.id };
        const userData = await tulpCollection.findOne(query);

        if (userData === null) {
            msg.channel.send(tulpConfig.notUserMsg);
            return;
        }

        const newTulpArr = userData.tulps.filter(t => t.username !== tulpName);

        if (userData.tulps.length === newTulpArr.length) {
            msg.channel.send(tulpConfig.noDataMsg);
            return;
        }

        if (newTulpArr.length) {
            const updateDoc = {
                $set: {
                    tulps: newTulpArr
                }
            };

            await tulpCollection.updateOne(query, updateDoc);
        }
        else {
            await tulpCollection.deleteOne(query);
        }

        msg.channel.send(deleteTulp.confirmMsg);
    }
}