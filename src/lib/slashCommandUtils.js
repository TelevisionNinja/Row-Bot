const apiVersion = 10;
const apiURL = `https://discord.com/api/v${apiVersion}`;

/**
 * builds a slash command json array
 * 
 * @param {*} commandArr 
 * @returns 
 */
export function buildCommandJSON(commandArr) {
    let slashCommandJSONs = [];

    for (let i = 0, n = commandArr.length; i < n; i++) {
        const command = commandArr[i].interactionData;

        // only include commands with slash variant
        if (command) {
            slashCommandJSONs.push(command);
        }
    }

    return slashCommandJSONs;
}

/**
 * register global slash commands
 * 
 * @param {*} slashCommands use buildCommandJSON()
 * @param {*} clientID 
 * @param {*} token 
 * @returns 
 */
export function loadGlobalSlashCommands(slashCommands, clientID, token) {
    return fetch(`${apiURL}/applications/${clientID}/commands`, {
        method: 'PUT',
        headers: {
            Authorization: `Bot ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(slashCommands)
    });
}

/**
 * register guild slash commands
 * 
 * @param {*} slashCommands use buildCommandJSON()
 * @param {*} clientID 
 * @param {*} token 
 * @param {*} guildID 
 * @returns 
 */
export function loadGuildSlashCommands(slashCommands, clientID, token, guildID) {
    return fetch(`${apiURL}/applications/${clientID}/guilds/${guildID}/commands`, {
        method: 'PUT',
        headers: {
            Authorization: `Bot ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(slashCommands)
    });
}

/**
 * unregister guild slash commands
 * 
 * @param {*} slashCommands use buildCommandJSON()
 * @param {*} clientID 
 * @param {*} token 
 * @param {*} guildID 
 */
export async function deleteGuildSlashCommands(slashCommands, clientID, token, guildID) {
    const response = await loadGuildSlashCommands(slashCommands, clientID, token, guildID);
    const data = await response.json();

    for (let i = 0, n = data.length; i < n; i++) {
        setTimeout(() => {
            console.log(data[i]);
            console.log();

            fetch(`${apiURL}/applications/${clientID}/guilds/${guildID}/commands/${data[i].id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bot ${token}`
                }
            });
        }, 5000 * i);
    }
}

/**
 * unregister global slash commands
 * 
 * @param {*} slashCommands use buildCommandJSON()
 * @param {*} clientID 
 * @param {*} token 
 */
export async function deleteGlobalSlashCommands(slashCommands, clientID, token) {
    const response = await loadGlobalSlashCommands(slashCommands, clientID, token);
    const data = await response.json();

    for (let i = 0, n = data.length; i < n; i++) {
        setTimeout(() => {
            console.log(data[i]);
            console.log();

            fetch(`${apiURL}/applications/${clientID}/commands/${data[i].id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bot ${token}`
                }
            });
        }, 5000 * i);
    }
}
