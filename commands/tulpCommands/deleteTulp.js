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
        const username = args.join(' ').trim();
        const query = {
            _id: msg.author.id,
            'tulps.username': username
        };
        const update = {
            $pull: {
                tulps: {
                    username: username
                }
            }
        };
        const result = await tulpCollection.updateOne(query, update);

        if (result.result.n) {
            msg.channel.send(deleteTulp.confirmMsg);

            const deleteQuery = {
                _id: msg.author.id,
                tulps: {
                    $size: 0
                }
            };
    
            await tulpCollection.deleteOne(deleteQuery);
        }
        else {
            msg.channel.send(tulpConfig.noDataMsg);
        }
    }
}