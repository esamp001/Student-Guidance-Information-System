HOW TO SETUP STUDENT'S GUIDANCE INFORMATION SYSTEM

1. Setup on server pg admin: 
DB_CLIENT=pg
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=Darkkone123
DB_NAME=students_ms_dev
DB_PORT=5432


2. Create a database name "students_ms_dev"
3. Run migrate npx "knex migrate:latest" -- To acquired all tables
4. Create trigger function for hash password in admin:
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION hash_admin_password()
RETURNS TRIGGER AS $$
BEGIN
  -- Only hash if password_hash is not already hashed
  IF NEW.password_hash NOT LIKE '$2b$%' THEN
    NEW.password_hash := crypt(NEW.password_hash, gen_salt('bf', 10));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER hash_admin_password_trigger
BEFORE INSERT OR UPDATE OF password_hash
ON users
FOR EACH ROW
EXECUTE FUNCTION hash_admin_password();

5. Run this query for admin account:
-- Insert into users table
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'letran_admin@gmail.com', 'letranAdmin123@', 'admin')
RETURNING id;

-- Then use the returned id to insert into administrator table
INSERT INTO administrator (user_id, first_name, middle_name, last_name)
VALUES (
  (SELECT id FROM users WHERE username = 'admin'),
  'Letran',
  NULL,
  'Admin'
);

copy and paste it to query database.
6. Now you can login admin account
email: letran_admin@gmail.com
password: letranAdmin123@ 