CREATE TABLE IF NOT EXISTS channel (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "user" (
    id VARCHAR(20) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) DEFAULT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guild (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guild_user (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    guild_id VARCHAR(20) NOT NULL,
    nickname VARCHAR(255) DEFAULT NULL,
    display_hex_color VARCHAR(7) DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES "user"(id),
    FOREIGN KEY (guild_id) REFERENCES guild(id),
    CONSTRAINT unique_user_guild UNIQUE (user_id, guild_id)
);

CREATE TABLE IF NOT EXISTS message (
    id VARCHAR(20) PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    guild_user_id INTEGER NOT NULL,
    channel_id VARCHAR(20) NOT NULL,
    FOREIGN KEY (guild_user_id) REFERENCES guild_user(id),
    FOREIGN KEY (channel_id) REFERENCES channel(id)
);

CREATE TABLE IF NOT EXISTS attachment (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(20) NOT NULL,
    url VARCHAR(255) NOT NULL,
    content_type VARCHAR(255) NOT NULL,
    name VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    FOREIGN KEY (message_id) REFERENCES message(id)
);

CREATE TABLE IF NOT EXISTS deleted_message (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(20) NOT NULL UNIQUE,
    deleted_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (message_id) REFERENCES message(id)
);

CREATE TABLE IF NOT EXISTS message_edit(
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    edited_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (message_id) REFERENCES message(id)
);