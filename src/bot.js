import {
    Client,
    InteractionType,
    ActivityType,
    cleanContent
} from 'discord.js';
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
import { deleteWebhook } from './lib/discordUtils.js';
import { randomInteger } from './lib/randomFunctions.js';
import { getChatBotReply } from './lib/chatBot.js';
import { default as audioUtils } from './lib/audioUtils.js';
import { extractAmpUrls } from './lib/urlUtils.js';
import { getCanonicals } from './lib/amputatorbot.js';
import {
    getTtsUrl,
    getTtsStream
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

    initializeIntervals,
    // loadSlashCommands
} from './lib/initialize.js';
import { channelIsActive as isActiveLateNight } from './intervalMessages/askLateNight.js';
import { channelIsActive as isActiveMemes } from './intervalMessages/memes.js';
import { channelIsActive as isActiveRule } from './intervalMessages/rule.js';
import {
    channelIsActiveDaily as isActiveDerpDaily,
    channelIsActiveRule as isActiveDerpRule
} from './intervalMessages/derp.js';
import config from '../config/config.json' with { type: 'json' };

const mentionRegex = new RegExp(`<@!?${clientID}>`, 'g');

//--------------------------------------------------------------------------------
// client vars

const client = new Client(clientOptions);
const cooldowns = new Map();
client.commands = commandMap;
client.tulpCommands = tulpCommandMap;
client.musicCommands = musicCommandMap;

//--------------------------------------------------------------------------------
// ready actions

client.on('ready', client => {
    // start interval messages
    initializeIntervals(client);

    console.log(`Ready Client: ${client.readyAt.toString()}`);

    // slash commands
    // loadSlashCommands();
});

client.on('shardReady', shardId => console.log(`Ready Shard ${shardId}: ${new Date().toString()}`));

//--------------------------------------------------------------------------------
// message actions

client.on('messageCreate', async msg => {
    // filter messages
    if (msg.author.bot || (!msg.content.length && !msg.attachments.size)) {
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
    // mark channels as active

    if (msg.channelId === config.askLateNight.channelID) {
        isActiveLateNight();
    }
    if (msg.channelId === config.memes.channelID) {
        isActiveMemes();
    }
    if (msg.channelId === config.rule.intervalChannelID) {
        isActiveRule();
    }
    if (msg.channelId === config.derp.intervalChannelID) {
        isActiveDerpDaily();
    }
    if (msg.channelId === config.derp.intervalWaitChannelID) {
        isActiveDerpRule();
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

    if (await sendEasyMsg.sendEasyMsg(msg)) {
        return;
    }

    //--------------------------------------------------------------------------------
    // chat bot

    if (hasBotMention(msg, false, true, false, false).mentioned) {
        // remove mentions from message
        const cleanMsg = cleanContent(msg.content.replaceAll(mentionRegex, ''), msg.channel).trim();

        if (cleanMsg.length > 0) {
            const replyStr = await getChatBotReply(msg.author.displayName, cleanMsg);

            // reply
            if (replyStr.length) {
                sendTypingMsg(msg, {
                    content: replyStr
                }, msg.content, true);
                return;
            }
        }
    }

    //--------------------------------------------------------------------------------
    // detect any mentions

    const {
        mentioned: botMention,
        names: foundNames
    } = hasBotMention(msg);

    if (botMention) {
        // remove mentions or name from message
        const noMentionsMsg = removeAllSpecialChars(removeMentions(msg.content, foundNames)).trim().toLowerCase();

        //--------------------------------------------------------------------------------
        // voice

        if (inGuild && msg.member.voice.channel) {
            if (noMentionsMsg === 'join me') {
                audioUtils.joinVC(msg);
                return;
            }
            else if (noMentionsMsg === 'leave') {
                audioUtils.leaveVC(msg.guild.id);
                return;
            }
            else if ((noMentionsMsg === 'speak' || noMentionsMsg === 'talk') && audioUtils.vcCheck(msg, false)) {
                const url = await getTtsUrl('Pinkie Pie', speechArr[randomInteger(speechArr.length)]);
                const stream = await getTtsStream(url);

                // play backup audio
                if (typeof stream === 'undefined') {
                    audioUtils.playFile(msg, audio[randomInteger(audio.length)]);
                }
                else {
                    audioUtils.playReadableStream(msg, stream);
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
                sendTypingMsg(msg, {
                    content: replyStr
                }, msg.content, true);
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
                sendTypingMsg(msg.channel, {
                    content: replyStr
                }, msg.content);
                return;
            }
        }
    }

    //--------------------------------------------------------------------------------
    // AMP links

    if (inGuild && msg.guild.id !== devGuildID) {
        return;
    }

    const links = await getCanonicals([...extractAmpUrls(msg.content).values()]);

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
    if (interaction.type !== InteractionType.ApplicationCommand) {
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
// connection

client.on('shardDisconnect', (closeEvent, shardId) => console.log(`Disconnected Shard ${shardId}: ${new Date().toString()}`));
client.on('shardReconnecting', shardId => console.log(`Reconnecting Shard ${shardId}: ${new Date().toString()}`));

client.on('shardResume', shardId => {
    // set activity again because the status will be blank
    client.user.setActivity({
        name: activityStatus,
        type: ActivityType.Custom,
        state: activityStatus,
        shardId: shardId
    });

    console.log(`Resumed Shard ${shardId}: ${new Date().toString()}`);
});

//--------------------------------------------------------------------------------
// tulp events

// delete webhook data
client.on('channelDelete', channel => deleteWebhook(channel.id));
client.on('threadDelete', thread => deleteWebhook(thread.id));

//--------------------------------------------------------------------------------
// welcome message

client.on('guildMemberAdd', member => {
    if (member.user.bot || member.guild.id !== devGuildID) {
        return;
    }

    const channel = member.guild.systemChannel;

    if (channel === null || !channel.permissionsFor(clientID).has('SendMessages')) {
        return;
    }

    const greetingMsg = greetings[randomInteger(greetings.length)];
    const msg = `Please check the <#${ruleChannelID}> channel for some info 🙂`;

    sendTypingMsg(channel, {
        content: `${greetingMsg} <@${member.id}> ${msg}`
    }, member.user.username);
});

//--------------------------------------------------------------------------------
// reaction roles

/**
 * 
 * @param {*} react 
 * @param {*} user 
 * @returns role id as a string or null
 */
async function getReactionRoleID(react, user) {
    if (react.partial) {
        try {
            await react.fetch();
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }

    //--------------------------------------------------------------------------------

    if (!react.message.guild || user.bot || react.message.guild.id !== devGuildID) {
        return null;
    }

    const roles = reactionRoles[react.message.id];

    if (typeof roles === 'undefined') {
        return null;
    }

    return roles[react.emoji.name];
}

client.on('messageReactionAdd', async (react, user) => {
    const roleID = await getReactionRoleID(react, user);

    if (roleID) {
        react.message.guild.members.cache.get(user.id).roles.add(roleID);
    }
});

client.on('messageReactionRemove', async (react, user) => {
    const roleID = await getReactionRoleID(react, user);

    if (roleID) {
        react.message.guild.members.cache.get(user.id).roles.remove(roleID);
    }
});

//--------------------------------------------------------------------------------
// error

client.on('error', error => console.log(`Error: ${new Date().toString()}\n${error}`));
client.on('shardError', (error, shardId) => console.log(`Error Shard ${shardId}: ${new Date().toString()}\n${error}`));
client.on('unhandledRejection', error => console.log(`Unhandled Rejection: ${new Date().toString()}\n${error}`));
client.on('uncaughtException', error => console.log(`Uncaught Exception: ${new Date().toString()}\n${error}`));
client.on('uncaughtExceptionMonitor', error => console.log(`Uncaught Exception Monitor: ${new Date().toString()}\n${error}`));

//--------------------------------------------------------------------------------
// login

client.login(token);
