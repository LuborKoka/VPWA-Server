Pouzivam **POSTGRESQL** databazu.  

Keby nahodou migracie neposluchali, v `db_backup` je [sql dump datatabazy](./db_backup/vpwa_backup) alebo [backup vytvoreny cez pg admina](./db_backup/VPWA_backup.tar)  


**PRED VYTVORENIM MODELOV:**

```sql
CREATE EXTENSION "uuid-ossp";
```


## Triggers

```sql
CREATE OR REPLACE FUNCTION prevent_column_change()
RETURNS TRIGGER AS $$
DECLARE
    table_name text;
    col_name text;
    old_value text;
    new_value text;
BEGIN
    table_name := TG_ARGV[0];
    col_name := TG_ARGV[1];

    EXECUTE format('SELECT OLD.%1$I, NEW.%1$I', col_name) INTO old_value, new_value USING OLD, NEW;

    IF old_value IS DISTINCT FROM new_value THEN
        RAISE EXCEPTION '% is read-only', col_name;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER readonly_user_joined_at
BEFORE UPDATE ON users_channels
FOR EACH ROW 
EXECUTE FUNCTION prevent_column_change('users_channels', 'joined_at');

CREATE TRIGGER readonly_channel_created_at
BEFORE UPDATE ON channels
FOR EACH ROW 
EXECUTE FUNCTION prevent_column_change('channels', 'created_at');

CREATE TRIGGER readonly_message_created_at
BEFORE UPDATE ON messages
FOR EACH ROW 
EXECUTE FUNCTION prevent_column_change('messages', 'created_at');


CREATE OR REPLACE FUNCTION prevent_general_channel_owner_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.username != 'general_channel_owner' THEN
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER prevent_general_channel_owner_deletion
BEFORE DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION prevent_general_channel_owner_deletion();


CREATE OR REPLACE FUNCTION prevent_general_channel_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.name = 'General' THEN
        RETURN NULL;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_general_channel_deletion
BEFORE DELETE ON channels
FOR EACH ROW
EXECUTE FUNCTION prevent_general_channel_deletion();
```



## Default channel

```sql
insert into users (email, password, username, status)
values ('-', '-', 'general_channel_owner', 'offline');

insert into channels (name, admin_id)
values ('General', (select id from users where username = 'general_channel_owner'));
```


## Raw SQL na vytvorenie tabuliek

```sql
CREATE EXTENSION "uuid-ossp";

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email varchar(100) UNIQUE NOT NULL,
    password varchar(72) NOT NULL,
    username varchar(32) UNIQUE NOT NULL,
    is_muted boolean DEFAULT FALSE,
    status varchar(7) NOT NULL DEFAULT 'online'
);

CREATE TABLE channels (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(32) UNIQUE NOT NULL,
    is_private boolean DEFAULT FALSE,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    admin_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE users_channels (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_user_banned boolean NOT NULL DEFAULT FALSE,
    joined_at timestamptz NOT NULL DEFAULT NOW(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_channel UNIQUE(user_id, channel_id)
);

CREATE TABLE messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    content varchar(256) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE
);

CREATE TABLE invitations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_channel_invitation UNIQUE(channel_id, user_id)
);

CREATE TABLE pings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE
);

CREATE TABLE votes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    voter_id uuid NOT NULL REFERENCES users(id) ON DELETE NO ACTION,
    channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    target_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
```
