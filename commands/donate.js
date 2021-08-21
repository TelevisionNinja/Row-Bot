import { default as config } from '../config.json';

const donateConfig = config.donate;

export default {
    names: donateConfig.names,
    description: donateConfig.description,
    argsRequired: false,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '',
    cooldown: 0,
    execute(msg, args) {
        msg.channel.send({
            embeds: [{
                title: 'Donate Here!',
                url: donateConfig.URL,
                description: donateConfig.description,
                image: {
                    url: `https://media.discordapp.net/avatars/${msg.client.user.id}/${msg.client.user.avatar}.png?size=1024`
                },
            }]
        });
    }
}
