import {
    Client,
    Intents
} from 'discord.js';
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
    tulps,
    webhooks
} from './lib/database.js';
import { default as tulpCache } from './lib/tulpCache.js';
import { randomMath } from './lib/randomFunctions.js';
import { getChatBotReply } from './lib/chatBot.js';
import { initialize as initializeHelp } from './commands/help.js';
import { initialize as initializeTulp } from './commands/tulpCommands/help.js';
import { initialize as initializeMusic } from './commands/musicCommands/help.js';
import {
    joinVC,
    vcCheck,
    leave,
    playFile
} from './lib/audio.js';

//--------------------------------------------------------------------------------
// config vars

const prefix = config.prefix,
    token = config.token,
    activityStatus = config.activityStatus,
    names = config.names.map(n => n.toLowerCase());

//--------------------------------------------------------------------------------
// client vars

const client = new Client({
    retryLimit: Infinity,

    intents: [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,

        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_WEBHOOKS
    ],

    partials: ['CHANNEL']
});
const cooldowns = new Map();
client.commands = [];
client.tulpCommands = [];
client.musicCommands = [];
// let noncommands = [];
let genMsg = [];
let intervalMsgs = [];
const minimumPermissions = ['MANAGE_WEBHOOKS', 'MANAGE_MESSAGES', 'SEND_MESSAGES'];
let audio = [];

//--------------------------------------------------------------------------------
// load commands, tulp commands, noncommands, general messages, and interval messages

const commandFiles = readdirSync('./commands/').filter(aFile => aFile.endsWith('.js'));
const tulpCommandFiles = readdirSync('./commands/tulpCommands/').filter(aFile => aFile.endsWith('.js'));
const musicCommandFiles = readdirSync('./commands/musicCommands/').filter(aFile => aFile.endsWith('.js'));
// const noncommandFiles = readdirSync('./noncommands/').filter(aFile => aFile.endsWith('.js'));
const genMsgFiles = readdirSync('./generalMessages/').filter(aFile => aFile.endsWith('.js'));
const intervalMsgFiles = readdirSync('./intervalMessages/').filter(aFile => aFile.endsWith('.js'));
const audioFiles = readdirSync('./audioFiles/');

for (let i = 0, n = commandFiles.length; i < n; i++) {
    client.commands[i] = (await import(`./commands/${commandFiles[i]}`)).default;
}

for (let i = 0, n = tulpCommandFiles.length; i < n; i++) {
    client.tulpCommands[i] = (await import(`./commands/tulpCommands/${tulpCommandFiles[i]}`)).default;
}

for (let i = 0, n = musicCommandFiles.length; i < n; i++) {
    client.musicCommands[i] = (await import(`./commands/musicCommands/${musicCommandFiles[i]}`)).default;
}

// for (let i = 0, n = noncommandFiles.length; i < n; i++) {
//     noncommands[i] = (await import(`./noncommands/${noncommandFiles[i]}`)).default;
// }

for (let i = 0, n = genMsgFiles.length; i < n; i++) {
    genMsg[i] = (await import(`./generalMessages/${genMsgFiles[i]}`)).default;
}

for (let i = 0, n = intervalMsgFiles.length; i < n; i++) {
    intervalMsgs[i] = (await import(`./intervalMessages/${intervalMsgFiles[i]}`)).default;
}

for (let i = 0, n = audioFiles.length; i < n; i++) {
    audio[i] = `./audioFiles/${audioFiles[i]}`;
}

//--------------------------------------------------------------------------------
// initialize help embeds

initializeHelp(client.commands);
initializeTulp(client.tulpCommands);
initializeMusic(client.musicCommands);

//--------------------------------------------------------------------------------
// login actions

client.on('ready', () => {
    // start interval messages
    for (let i = 0, n = intervalMsgs.length; i < n; i++) {
        intervalMsgs[i].execute(client);
    }

    //--------------------------------------------------------------------------------
    // set activity

    client.user.setActivity(activityStatus, { type: 'PLAYING' });

    //--------------------------------------------------------------------------------
    // console log the start up time

    console.log(`Row Bot is up ${client.readyAt.toString()}`);
});

//--------------------------------------------------------------------------------
// message actions

client.on('messageCreate', async msg => {
    // filter messages
    if (msg.author.bot || !msg.content.length) {
        return;
    }

    const isDM = msg.channel.type === 'DM';

    // permissions
    if (!isDM) {
        const guildMemberClient = msg.guild.me;

        // must be admin or have minimum perms
        if (!guildMemberClient.permissions.has('ADMINISTRATOR') && !guildMemberClient.permissions.has(minimumPermissions)) {
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

        if (command.guildOnly && isDM) {
            msg.channel.send('I can\'t execute that command in DM\'s');
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
            msg.channel.send(`Please provide arguments\nex: \`${prefix}${command.names[0]} ${command.usage}\``);
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
                msg.channel.send(`Please let me cooldown for ${timeLeft.toFixed(1)} second(s)`);
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
            msg.channel.send('I couldn\'t do that command for some reason 😢');
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
    // chat bot

    if (hasBotMention(msg, false, true, false)) {
        const noMentionsMsg = removeMentions(msgStr, '');
        const replyStr = await getChatBotReply(msg.author.id, noMentionsMsg);

        // reply
        if (replyStr.length) {
            sendTypingMsg(msg.channel, replyStr, msgStr);
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
        // remove mentions or name from message
        const noMentionsMsg = removeMentions(msgStr, selectedName);

        //--------------------------------------------------------------------------------
        // voice

        if (msg.member.voice.channel) {
            if (noMentionsMsg === 'join me') {
                joinVC(msg);

                return;
            }
            else if (noMentionsMsg === 'leave') {
                leave(msg.guild.id);

                return;
            }
            else if (vcCheck(msg) && (noMentionsMsg === 'speak' || noMentionsMsg === 'talk')) {
                const randAudio = randomMath(audio.length);
                playFile(msg, audio[randAudio]);

                return;
            }
        }

        //--------------------------------------------------------------------------------
        // noncommands

        // for (let i = 0, n = noncommands.length; i < n; i++) {
        //     const replyStr = noncommands[i].execute(msg, noMentionsMsg);

        //     // reply
        //     if (replyStr.length) {
        //         sendTypingMsg(msg.channel, replyStr, msgStr);
        //         return;
        //     }
        // }
    }
    else if (!hasMentions(msg, false)) {
        //--------------------------------------------------------------------------------
        // general message

        // remove mentions or name from message
        const noMentionsMsg = removeMentions(msgStr, '');

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

client.on('shardDisconnect', () => console.log(`Row Bot disconnected ${new Date().toString()}`));

//--------------------------------------------------------------------------------
// reconnect

client.on('shardResume', () => {
    // set activity

    client.user.setActivity(activityStatus, { type: 'PLAYING' });

    //--------------------------------------------------------------------------------
    // console log the start up time

    console.log(`Row Bot is up ${client.readyAt.toString()}`);
});

//--------------------------------------------------------------------------------
// delete webhook data

client.on('channelDelete', channel => {
    // delete from tulp cache

    const id = channel.id;

    tulpCache.remove(id);

    //--------------------------------------------------------------------------------
    // delete from db

    webhooks.delete(id);
});

//--------------------------------------------------------------------------------
// tulp cache

// cache user data and the channel webhook while the user is typing
client.on('typingStart', async typing => {
    // users

    const userID = typing.user.id;

    if (tulpCache.has(userID)) {
        tulpCache.resetCacheTime(userID);
    }
    else {
        const userData = await tulps.getAll(userID);

        if (userData.length) {
            tulpCache.insert(userID, userData);
        }
        else {
            tulpCache.insert(userID, null);
            return;
        }
    }

    //--------------------------------------------------------------------------------
    // webhooks

    const channelID = typing.channel.id;

    if (tulpCache.has(channelID)) {
        tulpCache.resetCacheTime(channelID);
    }
    else {
        const webhook = await webhooks.get(channelID);

        tulpCache.insert(channelID, webhook);
    }
});

//--------------------------------------------------------------------------------
// login

client.login(token);
