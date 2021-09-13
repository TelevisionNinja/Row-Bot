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
