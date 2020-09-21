use matthewpozsgaibelay;

create table users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    token VARCHAR(50) NOT NULL UNIQUE,
    link VARCHAR(100) UNIQUE
);
create table channels (
    channel_name VARCHAR(100) NOT NULL PRIMARY KEY,
    created_by_id INT,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);
create table messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    channel VARCHAR(100),
    replies_to INT,
    body TEXT,
    author_id INT,
    posted DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (channel) REFERENCES channels(channel_name) ON DELETE CASCADE ON UPDATE CASCADE
);

create table unread (
    unread_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    channel VARCHAR(100),
    num_unread  INT default 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (channel) REFERENCES channels(channel_name) ON DELETE CASCADE ON UPDATE CASCADE
);
