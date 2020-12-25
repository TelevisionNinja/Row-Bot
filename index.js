const Discord = require('discord.js');
const fileSys = require('fs');
const {
    prefix,
    token,
    activityStatus,
    aliases
} = require('./config.json');

const client = new Discord.Client();

//--------------------------------------------------------------------------------
// load commands, noncommands, and general messages

const commandFiles = fileSys.readdirSync('./commands/').filter(aFile => aFile.endsWith('.js'));
const noncommandFiles = fileSys.readdirSync('./noncommands/').filter(aFile => aFile.endsWith('.js'));
const genMsgFiles = fileSys.readdirSync('./generalMessages/').filter(aFile => aFile.endsWith('.js'));

const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();
client.noncommands = [];
client.genMsg = [];

for (const aFile of commandFiles) {
    const command = require(`./commands/${aFile}`);
    client.commands.set(command.name, command);
}

for (let i = 0; i < noncommandFiles.length; i++) {
    client.noncommands[i] = require(`./noncommands/${noncommandFiles[i]}`);
}

for (let i = 0; i < genMsgFiles.length; i++) {
    client.genMsg[i] = require(`./generalMessages/${genMsgFiles[i]}`);
}

//--------------------------------------------------------------------------------
// login bot

client.login(token);

client.on('ready', () => {
    console.log('Row Bot is up');
    client.user.setActivity(activityStatus, { type: 'PLAYING' });
});

//--------------------------------------------------------------------------------

client.on('message', msg => {
    if (msg.author.bot) {
        return;
    }

    const msgStr = msg.content.toLowerCase();

    if (!msgStr.startsWith(prefix)) {
        let botReplay = '';
        let replyBool = false;

        //--------------------------------------------------------------------------------
        // noncommands

        let nonCommandBool = false;

        for (let i = 0; i < aliases.length; i++) {
            if (msgStr.includes(aliases[i].toLowerCase())) {
                nonCommandBool = true;

                for (let j = 0; j < client.noncommands.length; j++) {
                    const { isNoncommand, replyStr } = client.noncommands[j].execute(msgStr);

                    if (isNoncommand) {
                        replyBool = true;
                        botReplay = replyStr;
                        break;
                    }
                }

                nonCommandBool = false;
                break;
            }
        }

        //--------------------------------------------------------------------------------
        // general message

        if (!nonCommandBool) {
            for (let i = 0; i < client.genMsg.length; i++) {
                const { hasReply, replyStr } = client.genMsg[i].execute(msgStr);
    
                if (hasReply) {
                    replyBool = true;
                    botReplay = replyStr;
                    break;
                }
            }
        }

        //--------------------------------------------------------------------------------
        // reply

        if (replyBool) {
            setTimeout(() => {
                msg.channel.startTyping();
    
                setTimeout(() => {
                    msg.channel.stopTyping();
                    msg.channel.send(botReplay);
                }, botReplay.length * 100); // time before send
            }, 950); // time before typing
        }

        return;
    }

    //--------------------------------------------------------------------------------
    // split command and arguments

    const args = msgStr.slice(prefix.length).trim().split(' ');
    const userCommand = args.shift();

    //--------------------------------------------------------------------------------
    // get command

    const command = client.commands.find(cmd =>
        (cmd.name === userCommand) ||
        (cmd.aliases && cmd.aliases.includes(userCommand)));

    if (!command) {
        return;
    }

    if (command.guildOnly && msg.channel.type === 'dm') {
        msg.channel.send('I can\'t execute that command in DM\'s');
        return;
    }

    if (command.args && !args.length) {
        msg.channel.send(`Please provide arguments\nex: ${prefix}${command.name} ${command.usage}`);
        return;
    }

    //--------------------------------------------------------------------------------
    // cooldown

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    
    const timestamps = cooldowns.get(command.name);
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
});
