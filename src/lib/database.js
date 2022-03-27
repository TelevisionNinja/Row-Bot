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

// console.log((await tulpDB.query(`
//     SELECT con.*
//     FROM pg_catalog.pg_constraint con
//         INNER JOIN pg_catalog.pg_class rel
//             ON rel.oid = con.conrelid
//         INNER JOIN pg_catalog.pg_namespace nsp
//             ON nsp.oid = connamespace
//     WHERE rel.relname = 'tulps';

//     -- ALTER TABLE tulps DROP CONSTRAINT tulps_pkey;
//     -- ALTER TABLE tulps ADD PRIMARY KEY (user_id, start_bracket, end_bracket);

//     -- ALTER TABLE tulps DROP CONSTRAINT tulps_user_id_start_bracket_end_bracket_key;
//     -- ALTER TABLE tulps DROP CONSTRAINT tulps_user_id_username_key;

//     -- DROP INDEX user_id_index;
//     -- DROP INDEX start_bracket_index;
//     -- DROP INDEX end_bracket_index;
// `)).rows);

// initialize
tulpDB.query(`
CREATE TABLE IF NOT EXISTS tulps(
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    avatar TEXT NOT NULL,
    start_bracket TEXT NOT NULL,
    end_bracket TEXT NOT NULL DEFAULT '',

    UNIQUE (user_id, username),
    PRIMARY KEY (user_id, start_bracket, end_bracket)
);

CREATE TABLE IF NOT EXISTS webhooks(
    channel_id TEXT PRIMARY KEY,
    id TEXT NOT NULL,
    token TEXT NOT NULL
);
`);

// update existing tables
tulpDB.query(`
ALTER TABLE tulps ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE tulps ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE tulps ALTER COLUMN username TYPE TEXT;
ALTER TABLE tulps ALTER COLUMN username SET NOT NULL;
ALTER TABLE tulps ALTER COLUMN avatar TYPE TEXT;
ALTER TABLE tulps ALTER COLUMN avatar SET NOT NULL;
ALTER TABLE tulps ALTER COLUMN start_bracket TYPE TEXT;
ALTER TABLE tulps ALTER COLUMN start_bracket SET NOT NULL;
ALTER TABLE tulps ALTER COLUMN end_bracket TYPE TEXT;
ALTER TABLE tulps ALTER COLUMN end_bracket SET NOT NULL;
ALTER TABLE tulps ALTER COLUMN end_bracket SET DEFAULT '';

ALTER TABLE webhooks ALTER COLUMN id TYPE TEXT;
ALTER TABLE webhooks ALTER COLUMN id SET NOT NULL;
ALTER TABLE webhooks ALTER COLUMN token TYPE TEXT;
ALTER TABLE webhooks ALTER COLUMN token SET NOT NULL;
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
    create(user_id, username, avatar) {
        return tulpDB.query(`
            INSERT INTO tulps (user_id, username, avatar, start_bracket)
            VALUES ($1, $2, $3, CONCAT($2, ':'));
        `, [user_id, username, avatar]);
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
    /**
     * 
     * @param {*} user_id discord id of the user
     * @param {*} text the user's text
     * @returns 
     */
    async findTulp(user_id, text) {
        return (await tulpDB.query(`
            SELECT username, avatar, start_bracket, end_bracket FROM tulps
            WHERE user_id = $1 AND SUBSTRING($2, 1, LENGTH(start_bracket)) = start_bracket AND SUBSTRING($2, LENGTH($2) - LENGTH(end_bracket) + 1) = end_bracket
            ORDER BY LENGTH(start_bracket) + LENGTH(end_bracket)
            DESC
            LIMIT 1;
        `, [user_id, text])).rows[0];
    },
    /**
     * checks if a user is in the db
     * 
     * @param {*} user_id 
     * @returns 
     */
    async check(user_id) {
        return (await tulpDB.query(`
            SELECT EXISTS (
                SELECT 1 FROM tulps
                WHERE user_id = $1
            );
        `, [user_id])).rows[0];
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
    updateUsernameAndBrackets(user_id, old_username, new_username) {
        return tulpDB.query(`
            UPDATE tulps
            SET username = $3, start_bracket = CONCAT($3, ':')
            WHERE user_id = $1 AND username = $2 AND start_bracket = CONCAT($2, ':') AND end_bracket = '';
        `, [user_id, old_username, new_username]);
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
