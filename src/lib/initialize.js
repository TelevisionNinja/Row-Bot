import {
    GatewayIntentBits,
    Partials,
    ActivityType
} from 'discord.js';
import { readdirSync } from 'fs';
import config from '../../config/config.json' assert { type: 'json' };
import { initialize as initializeHelp } from '../commands/help.js';
import { initialize as initializeTulpHelp } from '../commands/tulpCommands/help.js';
import { initialize as initializeMusicHelp } from '../commands/musicCommands/help.js';
import messages from '../../config/messages.json' assert { type: 'json' };
import reactionRoles from '../../config/reactionRoles.json' assert { type: 'json' };
import {
    buildCommandJSON,
    loadGlobalSlashCommands
} from './slashCommandUtils.js';

export {
    prefix,
    token,
    clientID,
    activityStatus,
    minimumPermissions,
    devGuildID,
    ruleChannelID,
    clientOptions,

    speechArr,
    audio,

    commandMap,
    tulpCommandMap,
    musicCommandMap,

    noncommands,
    genMsg,
    intervalMsgs,
    greetings,
    reactionRoles
};

//--------------------------------------------------------------------------------
// config vars

const prefix = config.prefix,
    token = config.token,
    clientID = config.clientID,
    activityStatus = `${config.activityStatus} | ${prefix}help or /help`,
    minimumPermissions = config.minimumPermissions,
    devGuildID = config.devGuildID,
    ruleChannelID = config.ruleChannelID,
    greetings = messages.greetings;

//--------------------------------------------------------------------------------
// client vars

const clientOptions = {
    intents: [
        // dm's
        GatewayIntentBits.DirectMessages,

        // guilds
        GatewayIntentBits.Guilds, // webhook management
        GatewayIntentBits.GuildMessages, // messages and proxy
        GatewayIntentBits.GuildVoiceStates, // music commands
        GatewayIntentBits.GuildMessageReactions, // reaction roles

        // priviledged
        GatewayIntentBits.GuildMembers, // late night bois, guild welcome message

        GatewayIntentBits.MessageContent // messages
    ],

    partials: [
        Partials.Channel, // dm channels
        Partials.Message, // reaction roles
        Partials.Reaction // reaction roles
    ],

    presence: {
        activities: [
            {
                name: activityStatus,
                type: ActivityType.Playing
            }
        ]
    },

    rest: { retries: Infinity }
};
let commandMap = new Map();
let tulpCommandMap = new Map();
let musicCommandMap = new Map();
let commands = [];
let tulpCommands = [];
let musicCommands = [];
let noncommands = [];
let genMsg = [];
let intervalMsgs = [];
const speechArr = [...messages.greetings.filter(g => g.length >= 5), ...messages.speech];
let audio = [];

//--------------------------------------------------------------------------------
// load commands, tulp commands, noncommands, general messages, and interval messages

const commandFiles = readdirSync('./src/commands/').filter(aFile => aFile.endsWith('.js'));
const tulpCommandFiles = readdirSync('./src/commands/tulpCommands/').filter(aFile => aFile.endsWith('.js'));
const musicCommandFiles = readdirSync('./src/commands/musicCommands/').filter(aFile => aFile.endsWith('.js'));
const noncommandFiles = readdirSync('./src/noncommands/').filter(aFile => aFile.endsWith('.js'));
const genMsgFiles = readdirSync('./src/generalMessages/').filter(aFile => aFile.endsWith('.js'));
const intervalMsgFiles = readdirSync('./src/intervalMessages/').filter(aFile => aFile.endsWith('.js'));
const audioFiles = readdirSync('./audioFiles/');

commands = commandFiles.map(f => import(`../commands/${f}`));
tulpCommands = tulpCommandFiles.map(f => import(`../commands/tulpCommands/${f}`));
musicCommands = musicCommandFiles.map(f => import(`../commands/musicCommands/${f}`));
noncommands = noncommandFiles.map(f => import(`../noncommands/${f}`));
genMsg = genMsgFiles.map(f => import(`../generalMessages/${f}`));
intervalMsgs = intervalMsgFiles.map(f => import(`../intervalMessages/${f}`));
audio = audioFiles.map(f => `../audioFiles/${f}`);

const loadedModules = await Promise.all([
    Promise.all(commands),
    Promise.all(tulpCommands),
    Promise.all(musicCommands),
    Promise.all(noncommands),
    Promise.all(genMsg),
    Promise.all(intervalMsgs)
]);

commands = loadedModules[0].map(i => i.default);
tulpCommands = loadedModules[1].map(i => i.default);
musicCommands = loadedModules[2].map(i => i.default);
noncommands = loadedModules[3];
genMsg = loadedModules[4];
intervalMsgs = loadedModules[5];

for (let i = 0, n = commands.length; i < n; i++) {
    const command = commands[i];

    for (let j = 0, m = command.names.length; j < m; j++) {
        commandMap.set(command.names[j], command);
    }
}

for (let i = 0, n = tulpCommands.length; i < n; i++) {
    const tulpCommand = tulpCommands[i];

    for (let j = 0, m = tulpCommand.names.length; j < m; j++) {
        tulpCommandMap.set(tulpCommand.names[j], tulpCommand);
    }
}

for (let i = 0, n = musicCommands.length; i < n; i++) {
    const musicCommand = musicCommands[i];

    for (let j = 0, m = musicCommand.names.length; j < m; j++) {
        musicCommandMap.set(musicCommand.names[j], musicCommand);
    }
}

//--------------------------------------------------------------------------------
// initialize help embeds

initializeHelp(commands);
initializeTulpHelp(tulpCommands);
initializeMusicHelp(musicCommands);

//--------------------------------------------------------------------------------
// initialize interval messages

let once = false;

export function initializeIntervals(client) {
    if (once || !client.guilds.cache.has(devGuildID)) {
        return;
    }

    once = true;

    for (let i = 0, n = intervalMsgs.length; i < n; i++) {
        intervalMsgs[i].execute(client);
    }
}

//--------------------------------------------------------------------------------
// slash commands

export async function loadSlashCommands() {
    let slashCommands = buildCommandJSON(commands);
    let breakBool = false;

    for (let i = 0, n = slashCommands.length; i < n; i++) {
        let slashCommand = slashCommands[i];

        if (slashCommand.name === 'tulp') {
            slashCommand.options = buildCommandJSON(tulpCommands);
            // slashCommands[i] = slashCommand;

            if (breakBool) {
                break;
            }

            breakBool = true;
        }
        else if (slashCommand.name === 'music') {
            slashCommand.options = buildCommandJSON(musicCommands);
            // slashCommands[i] = slashCommand;

            if (breakBool) {
                break;
            }

            breakBool = true;
        }
    }

    console.log('Started refreshing application (/) commands.');

    const response = await loadGlobalSlashCommands(slashCommands, clientID, token);

    if (response.ok) {
        console.log('Successfully reloaded application (/) commands.');
    }
    else {
        console.log(response);
    }
}
