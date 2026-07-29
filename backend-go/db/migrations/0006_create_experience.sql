CREATE TABLE experience (
    id SERIAL PRIMARY KEY,
    role TEXT NOT NULL,
    org TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE experience_tags (
    experience_id INTEGER NOT NULL REFERENCES experience(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (experience_id, tag_id)
);
