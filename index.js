import Eris from 'eris';
import { readdirSync } from 'fs';
import { default as config } from './config.json';
import {
    hasBotMention,
    sendTypingMsg,
    hasMentions
} from './lib/msgUtils.js';
import {
    removeAllSpecialChars,
    includesPhrase,
    removeMentions
} from './lib/stringUtils.js';
import { default as sendEasyMsg } from './commands/tulpCommands/easyMessages/sendEasyMsg.js';
import {
    tulpWebhooks,
    tulp
} from './lib/database.js';
import { default as tulpCache } from './lib/tulpCache.js';

//--------------------------------------------------------------------------------
// config vars

const prefix = config.prefix,
    token = config.token,
    activityStatus = config.activityStatus,
    names = config.names.map(n => n.toLowerCase());

//--------------------------------------------------------------------------------
// client vars

const client = new Eris(`Bot ${token}`);
let initialStart = true;
const cooldowns = new Map();
client.commands = [];
client.tulpCommands = [];
let noncommands = [];
let genMsg = [];
let intervalMsgs = [];

//--------------------------------------------------------------------------------
// load commands, tulp commands, noncommands, general messages, and interval messages

const commandFiles = readdirSync('./commands/').filter(aFile => aFile.endsWith('.js'));
const tulpCommandFiles = readdirSync('./commands/tulpCommands/').filter(aFile => aFile.endsWith('.js'));
const noncommandFiles = readdirSync('./noncommands/').filter(aFile => aFile.endsWith('.js'));
const genMsgFiles = readdirSync('./generalMessages/').filter(aFile => aFile.endsWith('.js'));
const intervalMsgFiles = readdirSync('./intervalMessages/').filter(aFile => aFile.endsWith('.js'));

for (let i = 0, n = commandFiles.length; i < n; i++) {
    client.commands[i] = (await import(`./commands/${commandFiles[i]}`)).default;
}

for (let i = 0, n = tulpCommandFiles.length; i < n; i++) {
    client.tulpCommands[i] = (await import(`./commands/tulpCommands/${tulpCommandFiles[i]}`)).default;
}

for (let i = 0, n = noncommandFiles.length; i < n; i++) {
    noncommands[i] = (await import(`./noncommands/${noncommandFiles[i]}`)).default;
}

for (let i = 0, n = genMsgFiles.length; i < n; i++) {
    genMsg[i] = (await import(`./generalMessages/${genMsgFiles[i]}`)).default;
}

for (let i = 0, n = intervalMsgFiles.length; i < n; i++) {
    intervalMsgs[i] = (await import(`./intervalMessages/${intervalMsgFiles[i]}`)).default;
}

//--------------------------------------------------------------------------------
// login actions

client.on('ready', () => {
    // start interval messages
    if (initialStart) {
        initialStart = false;

        for (let i = 0, n = intervalMsgs.length; i < n; i++) {
            intervalMsgs[i].execute(client);
        }
    }

    //--------------------------------------------------------------------------------
    // set activity

    client.editStatus('online', {
        name: activityStatus,
        type: 0
    });

    //--------------------------------------------------------------------------------
    // console log the start up time

    console.log(`Row Bot is up ${new Date(client.startTime).toString()}`);
});

//--------------------------------------------------------------------------------
// message actions

client.on('messageCreate', async msg => {
    // permissions

    const notBot = !msg.author.bot;
    const hasLength = msg.content.length;
    const msgFilterBool = notBot && hasLength;

    if (!msgFilterBool) {
        return;
    }

    if (msg.channel.type !== 1) {
        const perms = msg.channel.permissionsOf(msg.channel.client.user.id);
        const isAdmin = perms.has('administrator');
        const hasMinimumPerms = perms.has('manageWebhooks') && perms.has('manageMessages') && perms.has('sendMessages');
        const meetsConditions = msgFilterBool && (isAdmin || hasMinimumPerms);

        if (!meetsConditions) {
            return;
        }
    }

    //--------------------------------------------------------------------------------
    // commands and messages

    const msgStr = msg.content.toLowerCase();

    if (msgStr.startsWith(prefix)) {
        // split command and arguments

        let args = msgStr.slice(prefix.length).trim().split(' ');
        const userCommand = args.shift();

        //--------------------------------------------------------------------------------
        // get command

        const command = client.commands.find(cmd => cmd.names.includes(userCommand));

        if (typeof command === 'undefined') {
            return;
        }

        if (command.guildOnly && msg.channel.type === 1) {
            msg.channel.createMessage('I can\'t execute that command in DM\'s');
            return;
        }

        if (command.noSpecialChars) {
            const argStr = removeAllSpecialChars(args.join(' '));

            if (argStr.length) {
                args = argStr.split(' ');
            }
            else {
                args = [];
            }
        }

        if (command.argsRequired && !args.length) {
            msg.channel.createMessage(`Please provide arguments\nex: \`${prefix}${command.names[0]} ${command.usage}\``);
            return;
        }

        //--------------------------------------------------------------------------------
        // cooldown

        if (!cooldowns.has(command.names[0])) {
            cooldowns.set(command.names[0], new Map());
        }

        const timestamps = cooldowns.get(command.names[0]);
        const cooldownAmount = command.cooldown * 1000;
        const now = Date.now();

        if (timestamps.has(msg.author.id)) {
            const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                msg.channel.createMessage(`Please let me cooldown for ${timeLeft.toFixed(1)} second(s)`);
                return;
            }
        }

        timestamps.set(msg.author.id, now);
        setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);

        //--------------------------------------------------------------------------------
        // execute command

        try {
            command.execute(msg, args);
        }
        catch (error) {
            msg.channel.createMessage('I couldn\'t do that command for some reason 😢');
            console.log(error);
        }

        return;
    }

    //--------------------------------------------------------------------------------
    // send tulp messages easily

    const userData = tulpCache.get(msg.author.id);

    if (userData !== null) {
        const webhook = tulpCache.get(msg.channel.id);

        if (await sendEasyMsg.sendEasyMsg(msg, userData, webhook)) {
            return;
        }
    }

    //--------------------------------------------------------------------------------
    // set up vars for noncommands and general messages

    let botMention = hasBotMention(msg);
    let selectedName = '';

    //--------------------------------------------------------------------------------
    // detect any mentions

    if (!botMention) {
        for (let i = 0, n = names.length; i < n; i++) {
            const currentName = names[i];

            if (currentName.length > selectedName.length &&
                includesPhrase(msgStr, currentName, false)) {
                botMention = true;
                selectedName = currentName;
            }
        }
    }

    if (botMention) {
        //--------------------------------------------------------------------------------
        // noncommands

        // remove mentions or name from message
        const noMentionsMsg = removeMentions(msgStr, selectedName);

        for (let i = 0, n = noncommands.length; i < n; i++) {
            const replyStr = noncommands[i].execute(msg, noMentionsMsg);

            // reply
            if (replyStr.length) {
                sendTypingMsg(msg.channel, replyStr, msgStr);
                return;
            }
        }
    }
    else if (!hasMentions(msg, false)) {
        //--------------------------------------------------------------------------------
        // general message

        // remove mentions or name from message
        const noMentionsMsg = removeMentions(msgStr, selectedName);

        for (let i = 0, n = genMsg.length; i < n; i++) {
            const replyStr = genMsg[i].execute(msg, noMentionsMsg);

            // reply
            if (replyStr.length) {
                sendTypingMsg(msg.channel, replyStr, msgStr);
                return;
            }
        }
    }
});

//--------------------------------------------------------------------------------
// disconnect

client.on('disconnect', () => console.log(`Row Bot disconnected ${new Date().toString()}`));

//--------------------------------------------------------------------------------
// error

client.on('error', (error) => console.log(error));

//--------------------------------------------------------------------------------
// delete webhook data

client.on('channelDelete', channel => {
    // delete from tulp cache

    const id = channel.id;

    tulpCache.remove(id);

    //--------------------------------------------------------------------------------
    // delete from db

    const deleteQuery = { _id: id };

    tulpWebhooks.deleteOne(deleteQuery);
});

//--------------------------------------------------------------------------------
// tulp cache

// cache user data and the channel webhook while the user is typing
client.on('typingStart', async (channel, user) => {
    // users

    const userID = user.id;

    if (tulpCache.has(userID)) {
        tulpCache.resetCacheTime(userID);
    }
    else {
        const query = { _id: userID };
        const userData = await tulp.findOne(query);

        tulpCache.insert(userID, userData);

        if (userData === null) {
            return;
        }
    }

    //--------------------------------------------------------------------------------
    // webhooks

    const channelID = channel.id;

    if (tulpCache.has(channelID)) {
        tulpCache.resetCacheTime(channelID);
    }
    else {
        const query = { _id: channelID };
        const webhook = await tulpWebhooks.findOne(query);

        if (webhook) {
            tulpCache.insert(channelID, webhook.webhook);
        }
    }
});

//--------------------------------------------------------------------------------
// login

client.connect();
