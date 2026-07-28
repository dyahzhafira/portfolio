ALTER TABLE media
    ALTER COLUMN project_id DROP NOT NULL,
    ADD COLUMN experience_id INTEGER REFERENCES experience(id) ON DELETE CASCADE,
    ADD CONSTRAINT media_owner_check CHECK (
        (project_id IS NOT NULL AND experience_id IS NULL) OR
        (project_id IS NULL AND experience_id IS NOT NULL)
    );
