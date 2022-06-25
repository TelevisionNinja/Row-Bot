import { ShardingManager } from 'discord.js';
import config from '../config/config.json' assert { type: 'json' };

const manager = new ShardingManager('./src/bot.js', { token: config.token });

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

try {
    await manager.spawn();
}
catch (error) {
    console.log(error);
}
