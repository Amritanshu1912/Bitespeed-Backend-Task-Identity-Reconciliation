-- change to fluxkart database 
\c fluxkart;

-- Create the table
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  phone_number bigint,
  email VARCHAR(255),
  linked_id INTEGER,
  link_precedence VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  FOREIGN KEY (linked_id) REFERENCES contacts (id)
);

-- Insert data into the table
INSERT INTO contacts (phone_number, email, linked_id, link_precedence, created_at, updated_at)
VALUES
  ('1234567890', 'john@example.com', null, 'primary', NOW(), NOW()),
  ('9876543210', 'mike@example.com', 1, 'secondary', NOW(), NOW()),
  ('5555932555', 'bar@example.com', null, 'primary', NOW(), NOW()),
  ('6186352616', 'bar@example.com', 3, 'secondary', NOW(), NOW()),
  ('9947583299', 'baz@example.com', null, 'primary', NOW(), NOW());

-- Add password to postgres user
  ALTER USER postgres WITH PASSWORD 'password1';
