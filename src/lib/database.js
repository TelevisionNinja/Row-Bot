import postgres from 'pg';
import config from '../../config/config.json' assert { type: 'json' };

const postgresConfig = config.postgresql;

const tulpDB = new postgres.Pool({
    host: postgresConfig.host,
    port: postgresConfig.port,
    user: postgresConfig.user,
    password: postgresConfig.password,
    database: postgresConfig.database,
    max: 32,
    idleTimeoutMillis: 0
});

// initialize
tulpDB.query(`
CREATE TABLE IF NOT EXISTS tulps(
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    avatar TEXT NOT NULL,
    start_bracket TEXT NOT NULL,
    end_bracket TEXT NOT NULL,

    UNIQUE (user_id, username),
    PRIMARY KEY (user_id, username),
    UNIQUE (user_id, start_bracket, end_bracket)
);

CREATE INDEX IF NOT EXISTS user_id_index ON tulps(user_id);

CREATE TABLE IF NOT EXISTS webhooks(
    channel_id TEXT PRIMARY KEY,
    id TEXT,
    token TEXT
);
`);

export const webhooks = {
    async get(channel_id) {
        return (await tulpDB.query(`
            SELECT id, token FROM webhooks
            WHERE channel_id = $1;
        `, [channel_id])).rows[0];
    },
    set(channel_id, id, token) {
        tulpDB.query(`
            INSERT INTO webhooks (channel_id, id, token)
            VALUES ($1, $2, $3);
        `, [channel_id, id, token]);
    },
    update(channel_id, id, token) {
        tulpDB.query(`
            UPDATE webhooks
            SET id = $2, token = $3
            WHERE channel_id = $1;
        `, [channel_id, id, token]);
    },
    upsert(channel_id, id, token) {
        tulpDB.query(`
            INSERT INTO webhooks (channel_id, id, token)
            VALUES ($1, $2, $3)
            ON CONFLICT (channel_id)
            DO UPDATE
            SET id = $2, token = $3;
        `, [channel_id, id, token]);
    },
    delete(channel_id) {
        tulpDB.query(`
            DELETE FROM webhooks
            WHERE channel_id = $1;
        `, [channel_id]);
    }
};

export const tulps = {
    set(user_id, username, avatar, start_bracket, end_bracket) {
        return tulpDB.query(`
            INSERT INTO tulps (user_id, username, avatar, start_bracket, end_bracket)
            VALUES ($1, $2, $3, $4, $5);
        `, [user_id, username, avatar, start_bracket, end_bracket]);
    },
    async getAll(user_id) {
        return (await tulpDB.query(`
            SELECT username, avatar, start_bracket, end_bracket FROM tulps
            WHERE user_id = $1;
        `, [user_id])).rows;
    },
    async get(user_id, username) {
        return (await tulpDB.query(`
            SELECT username, avatar, start_bracket, end_bracket FROM tulps
            WHERE user_id = $1 AND username = $2;
        `, [user_id, username])).rows[0];
    },
    delete(user_id, username) {
        return tulpDB.query(`
            DELETE FROM tulps
            WHERE user_id = $1 AND username = $2;
        `, [user_id, username]);
    },
    updateBrackets(user_id, username, start_bracket, end_bracket) {
        return tulpDB.query(`
            UPDATE tulps
            SET start_bracket = $3, end_bracket = $4
            WHERE user_id = $1 AND username = $2;
        `, [user_id, username, start_bracket, end_bracket]);
    },
    updateUsername(user_id, old_username, new_username) {
        return tulpDB.query(`
            UPDATE tulps
            SET username = $3
            WHERE user_id = $1 AND username = $2;
        `, [user_id, old_username, new_username]);
    },
    updateUsernameAndBrackets(user_id, old_username, new_username, old_start_bracket, new_start_bracket, end_bracket) {
        return tulpDB.query(`
            UPDATE tulps
            SET username = $3, start_bracket = $5
            WHERE user_id = $1 AND username = $2 AND start_bracket = $4 AND end_bracket = $6;
        `, [user_id, old_username, new_username, old_start_bracket, new_start_bracket, end_bracket]);
    },
    updateAvatar(user_id, username, avatar) {
        return tulpDB.query(`
            UPDATE tulps
            SET avatar = $3
            WHERE user_id = $1 AND username = $2;
        `, [user_id, username, avatar]);
    },
    async listAll(user_id) {
        return (await tulpDB.query(`
            SELECT username FROM tulps
            WHERE user_id = $1;
        `, [user_id])).rows;
    }
};
