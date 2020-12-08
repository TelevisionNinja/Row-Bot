export const name = 'reload';
export const description = 'Reloads a command';
export const args = true;
export const usage = '<command>';
export const cooldown = 0;
export function execute(msg, args) {
    const commandName = args[0].toLowerCase();
    const command = msg.client.commands.get(commandName)
        || msg.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) {
        msg.channel.send(`\'${commandName}\' doesn't exist`);
        return;
    }
}