CREATE TABLE IF NOT EXISTS channel (
    id PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user (
    id PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guild (
    id PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guild_user (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    guild_id INT NOT NULL,
    nickname VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (guild_id) REFERENCES guild(id)
);

CREATE TABLE IF NOT EXISTS message (
    id PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    guild_user_id INT NOT NULL,
    channel_id INT NOT NULL,
    attachment VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (guild_user_id) REFERENCES guild_user(id),
    FOREIGN KEY (channel_id) REFERENCES channel(id),
);

CREATE TABLE IF NOT EXISTS deleted_message(
    id SERIAL PRIMARY KEY,
    message_id INT NOT NULL UNIQUE,
    deleted_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (message_id) REFERENCES message(id)
);

CREATE TABLE IF NOT EXISTS message_edit(
    id SERIAL PRIMARY KEY,
    message_id INT NOT NULL,
    content TEXT NOT NULL,
    edited_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (message_id) REFERENCES message(id)
);