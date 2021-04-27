import { default as tulpConfig } from './tulpConfig.json';
import { default as config } from '../../config.json';
import { extractNameAndAvatar } from '../../lib/msgUtils.js';
import { tulp as tulpCollection } from '../../lib/database.js';

const create = tulpConfig.create,
    tagSeparator = config.tagSeparator;

export default {
    names: create.names,
    description: create.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: `<name>${tagSeparator} <image link or image upload>`,
    async execute(msg, args) {
        const {
            success,
            validURL,
            username,
            avatarLink
        } = extractNameAndAvatar(msg, args);

        if (!success) {
            msg.channel.createMessage('Please provide a name and a profile picture');
            return;
        }

        if (!validURL) {
            msg.channel.createMessage('Please provide a valid URL for the avatar');
            return;
        }

        const checkQuery = { _id: msg.author.id };
        const isUser = await tulpCollection.countDocuments(checkQuery, { limit: 1 });

        if (isUser) {
            const updateQuery = {
                _id: msg.author.id,
                'tulps.username': { $ne: username }
            };
            const update = {
                $push: {
                    tulps: {
                        username: username,
                        avatar: avatarLink,
                        startBracket: `${username}:`,
                        endBracket: ''
                    }
                }
            };
            const result = await tulpCollection.updateOne(updateQuery, update);

            if (result.result.n) {
                msg.channel.createMessage(create.confirmMsg);
            }
            else {
                msg.channel.createMessage(create.existingMsg);
            }
        }
        else {
            const newUser = {
                _id: msg.author.id,
                tulps: [{
                    username: username,
                    avatar: avatarLink,
                    startBracket: `${username}:`,
                    endBracket: ''
                }]
            };

            tulpCollection.insertOne(newUser);
            msg.channel.createMessage(create.confirmMsg);
        }
    }
}