import { Client } from 'discord.js';
import {
    hasBotMention,
    sendTypingMsg,
    hasMentions
} from './lib/msgUtils.js';
import {
    removeAllSpecialChars,
    removeMentions
} from './lib/stringUtils.js';
import { default as sendEasyMsg } from './commands/tulpCommands/easyMessages/sendEasyMsg.js';
import { default as tulpCache } from './lib/tulpCache.js';
import { randomMath } from './lib/randomFunctions.js';
import { getChatBotReply } from './lib/chatBot.js';
import { default as audioPlayer } from './lib/audio.js';
import { extractAndConvertAmpLinks } from './lib/urlUtils.js';
import { Readable } from 'stream';
import {
    getTtsUrl,
    getTtsBuffer
} from './commands/tts.js';
import {
    // config vars
    prefix,
    token,
    clientID,
    activityStatus,
    minimumPermissions,
    devGuildID,
    ruleChannelID,
    clientOptions,

    // audio
    speechArr,
    audio,

    // commands
    commandMap,
    tulpCommandMap,
    musicCommandMap,

    noncommands,
    genMsg,
    greetings,
    reactionRoles,

    initializeIntervals
} from './initialize.js';

//--------------------------------------------------------------------------------
// client vars

const client = new Client(clientOptions);
const cooldowns = new Map();
client.commands = commandMap;
client.tulpCommands = tulpCommandMap;
client.musicCommands = musicCommandMap;

//--------------------------------------------------------------------------------
// login actions

client.on('ready', () => {
    // start interval messages
    initializeIntervals(client);

    //--------------------------------------------------------------------------------
    // set activity

    client.user.setActivity(activityStatus, { type: 'PLAYING' });

    //--------------------------------------------------------------------------------
    // console log the start up time

    console.log(`Startup: ${client.readyAt.toString()}`);
});

//--------------------------------------------------------------------------------
// message actions

client.on('messageCreate', async msg => {
    // filter messages
    if (msg.author.bot || !msg.content.length) {
        return;
    }

    const inGuild = msg.inGuild();

    // permissions
    if (inGuild) {
        const permissions = msg.channel.permissionsFor(clientID);

        // must be admin or have minimum permissions
        if (!permissions.has(minimumPermissions)) {
            return;
        }
    }

    //--------------------------------------------------------------------------------
    // commands and messages

    if (msg.content.startsWith(prefix)) {
        // split command and arguments

        // discord trims the original message so only a left trim is needed
        let args = msg.content.slice(prefix.length).trimStart().split(' ');
        const userCommand = args.shift().toLowerCase();

        //--------------------------------------------------------------------------------
        // get command

        const command = client.commands.get(userCommand);

        if (typeof command === 'undefined') {
            return;
        }

        if (command.guildOnly && !inGuild) {
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
            msg.reply(`Please provide arguments\nex: \`${prefix}${command.names[0]} ${command.usage}\``);
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
                msg.reply(`Please let me cooldown for ${timeLeft.toFixed(1)} second(s)`);
                return;
            }
        }

        timestamps.set(msg.author.id, now);
        setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);

        //--------------------------------------------------------------------------------
        // execute command

        try {
            await command.execute(msg, args);
        }
        catch (error) {
            msg.reply('I couldn\'t do that command for some reason 😢');
            console.log(error);
        }

        return;
    }

    //--------------------------------------------------------------------------------
    // send tulp messages easily

    const userData = tulpCache.get(msg.author.id);

    if (userData !== null && await sendEasyMsg.sendEasyMsg(msg, userData)) {
        return;
    }

    //--------------------------------------------------------------------------------
    // chat bot

    if (hasBotMention(msg, false, true, false, false).mentioned) {
        const noMentionsMsg = removeMentions(msg.content);
        const replyStr = await getChatBotReply(msg.author.id, noMentionsMsg);

        // reply
        if (replyStr.length) {
            sendTypingMsg(msg, replyStr, msg.content, true);
            return;
        }
    }

    //--------------------------------------------------------------------------------
    // detect any mentions

    const {
        mentioned: botMention,
        name: foundName
    } = hasBotMention(msg);

    if (botMention) {
        // remove mentions or name from message
        const noMentionsMsg = removeAllSpecialChars(removeMentions(msg.content, foundName)).trim().toLowerCase();

        //--------------------------------------------------------------------------------
        // voice

        if (inGuild && msg.member.voice.channel) {
            if (noMentionsMsg === 'join me') {
                audioPlayer.joinVC(msg);
                return;
            }
            else if (noMentionsMsg === 'leave') {
                audioPlayer.leave(msg.guild.id);
                return;
            }
            else if ((noMentionsMsg === 'speak' || noMentionsMsg === 'talk') && audioPlayer.vcCheck(msg)) {
                const url = await getTtsUrl('Pinkie Pie', speechArr[randomMath(speechArr.length)]);

                // play backup audio
                if (!url.length) {
                    audioPlayer.playFile(msg, audio[randomMath(audio.length)]);
                    return;
                }

                const buffer = await getTtsBuffer(url);

                if (typeof buffer !== 'undefined') {
                    audioPlayer.playStream(msg, Readable.from(buffer));
                }

                return;
            }
        }

        //--------------------------------------------------------------------------------
        // noncommands

        for (let i = 0, n = noncommands.length; i < n; i++) {
            const replyStr = noncommands[i].execute(msg, noMentionsMsg);

            // reply
            if (replyStr.length) {
                sendTypingMsg(msg, replyStr, msg.content, true);
                return;
            }
        }
    }
    else if (!hasMentions(msg, false)) {
        //--------------------------------------------------------------------------------
        // general message

        // remove mentions from message
        const noMentionsMsg = removeAllSpecialChars(removeMentions(msg.content)).trim().toLowerCase();

        for (let i = 0, n = genMsg.length; i < n; i++) {
            const replyStr = genMsg[i].execute(msg, noMentionsMsg);

            // reply
            if (replyStr.length) {
                sendTypingMsg(msg.channel, replyStr, msg.content);
                return;
            }
        }
    }

    //--------------------------------------------------------------------------------
    // AMP links

    if (inGuild && msg.guild.id !== devGuildID) {
        return;
    }

    const links = await extractAndConvertAmpLinks(msg.content);

    if (links.length) {
        msg.reply({
            content: `It looks like you sent an AMP link. You should check out the canonical link instead for privacy reasons:\n${links.join('\n')}`,
            allowedMentions: {
                repliedUser: false
            }
        });
    }
});

//--------------------------------------------------------------------------------
// interaction actions

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) {
        return;
    }

    //--------------------------------------------------------------------------------
    // get command

    const command = client.commands.get(interaction.commandName);

    if (command.guildOnly && !interaction.inGuild()) {
        interaction.reply('I can\'t execute that command in DM\'s');
        return;
    }

    //--------------------------------------------------------------------------------
    // execute command

    try {
        await command.executeInteraction(interaction);
    }
    catch (error) {
        const content = {
            content: 'I couldn\'t do that command for some reason 😢',
            ephemeral: true
        };

        if (interaction.deferred) {
            interaction.editReply(content);
        }
        else {
            interaction.reply(content);
        }

        console.log(error);
    }
});

//--------------------------------------------------------------------------------
// disconnect

client.on('shardDisconnect', () => console.log(`Disconnected: ${new Date().toString()}`));

//--------------------------------------------------------------------------------
// reconnect

client.on('shardResume', () => {
    // set activity

    client.user.setActivity(activityStatus, { type: 'PLAYING' });

    //--------------------------------------------------------------------------------
    // console log the start up time

    console.log(`Reconnected: ${new Date().toString()}`);
});

//--------------------------------------------------------------------------------
// tulp events

// delete webhook data
client.on('channelDelete', channel => tulpCache.deleteWebhook(channel.id));
client.on('threadDelete', thread => tulpCache.deleteWebhook(thread.id));

// cache user data and the channel webhook while the user is typing
client.on('typingStart', typing => tulpCache.loadCache(typing.user.id, typing.channel.id));

//--------------------------------------------------------------------------------
// welcome message

client.on('guildMemberAdd', member => {
    if (member.user.bot || member.guild.id !== devGuildID) {
        return;
    }

    const channel = member.guild.systemChannel;

    if (channel === null || !channel.permissionsFor(clientID).has('SEND_MESSAGES')) {
        return;
    }

    const greetingMsg = greetings[randomMath(greetings.length)];
    const msg = `Please check the <#${ruleChannelID}> channel for some info 🙂`;

    sendTypingMsg(channel, `${greetingMsg} <@${member.id}> ${msg}`, member.user.username);
});

//--------------------------------------------------------------------------------
// reaction roles

client.on('messageReactionAdd', async (react, user) => {
    if (react.partial) {
        try {
            await react.fetch();
        }
        catch (error) {
            console.log(error);
            return;
        }
    }

    //--------------------------------------------------------------------------------

    if (!react.message.guild || user.bot || react.message.guild.id !== devGuildID) {
        return;
    }

    const roles = reactionRoles[react.message.id];

    if (typeof roles === 'undefined') {
        return;
    }

    const roleID = roles[react.emoji.name];

    if (typeof roleID === 'undefined') {
        return;
    }

    react.message.guild.members.cache.get(user.id).roles.add(roleID);
});

client.on('messageReactionRemove', async (react, user) => {
    if (react.partial) {
        try {
            await react.fetch();
        }
        catch (error) {
            console.log(error);
            return;
        }
    }

    //--------------------------------------------------------------------------------

    if (!react.message.guild || user.bot || react.message.guild.id !== devGuildID) {
        return;
    }

    const roles = reactionRoles[react.message.id];

    if (typeof roles === 'undefined') {
        return;
    }

    const roleID = roles[react.emoji.name];

    if (typeof roleID === 'undefined') {
        return;
    }

    react.message.guild.members.cache.get(user.id).roles.remove(roleID);
});

//--------------------------------------------------------------------------------
// login

client.login(token);
