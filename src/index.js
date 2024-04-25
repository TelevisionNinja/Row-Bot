import { ShardingManager } from 'discord.js';
import config from '../config/config.json' with { type: 'json' };

const manager = new ShardingManager('./src/bot.js', { token: config.token });

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}: ${new Date().toString()}`));

try {
    await manager.spawn();
}
catch (error) {
    console.log(error);
}
