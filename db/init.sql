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

CREATE TABLE IF NOT EXISTS ban_type (
    id SERIAL PRIMARY KEY,
    ban_type_name VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ban_role (
    id SERIAL PRIMARY KEY,
    role_type_name VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ban (
    id SERIAL PRIMARY KEY,
    guild_id VARCHAR(20) NOT NULL,
    ban_type_id INTEGER NOT NULL,
    reason TEXT DEFAULT NULL,
    banned_at TIMESTAMP DEFAULT NOW(),
    unbanned_at TIMESTAMP DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (guild_id) REFERENCES guild(id),
    FOREIGN KEY (ban_type_id) REFERENCES ban_type(id)
);

CREATE TABLE IF NOT EXISTS ban_participant (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    ban_id INTEGER NOT NULL,
    ban_role_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "user"(id),
    FOREIGN KEY (ban_id) REFERENCES ban(id),
    FOREIGN KEY (ban_role_id) REFERENCES ban_role(id)
);

CREATE TABLE IF NOT EXISTS support_category (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_ticket (
    id SERIAL PRIMARY KEY,
    ticket_id UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    
    guild_user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    content TEXT DEFAULT NULL,
    is_anonymous BOOLEAN DEFAULT NULL,
    is_response_requested BOOLEAN DEFAULT NULL,

    ticket_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    closed_at TIMESTAMP DEFAULT NULL,

    FOREIGN KEY (guild_user_id) REFERENCES guild_user(id),
    FOREIGN KEY (category_id) REFERENCES support_category(id),
    CONSTRAINT unique_ticket UNIQUE (ticket_id),
    CONSTRAINT valid_ticket_status CHECK (ticket_status IN ('pending', 'open', 'closed'))
);

INSERT INTO ban_role (role_type_name) VALUES ('banned'), ('banning'), ('unbanned'), ('unbanning');
INSERT INTO support_category (category_name) VALUES ('Question'), ('Request'), ('Suggestion'), ('Idea'), ('Information'), ('Feedback'), ('Report'), ('Other');