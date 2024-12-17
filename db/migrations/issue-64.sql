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
    is_anonymous BOOLEAN NOT NULL,
    is_response_requested BOOLEAN NOT NULL,

    ticket_status VARCHAR(20) NOT NULL DEFAULT 'open',
    closed_at TIMESTAMP DEFAULT NULL,

    FOREIGN KEY (guild_user_id) REFERENCES guild_user(id),
    FOREIGN KEY (category_id) REFERENCES support_category(id),
    CONSTRAINT unique_ticket UNIQUE (ticket_id),
    CONSTRAINT valid_ticket_status CHECK (ticket_status IN ('open', 'closed')),
    CONSTRAINT valid_ticket_status_closed CHECK (ticket_status = 'closed' AND closed_at IS NOT NULL),
    CONSTRAINT valid_ticket_status_open CHECK (ticket_status = 'open' AND closed_at IS NULL)
);

INSERT INTO support_category (category_name) VALUES ('Question'), ('Request'), ('Suggestion'), ('Idea'), ('Information'), ('Feedback'), ('Report'), ('Other');