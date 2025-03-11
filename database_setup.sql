-- SCHEMA: purchase_history

-- DROP SCHEMA IF EXISTS purchase_history ;

--INSERT INTO purchase_history.shops (name) VALUES ('Shop_1');

CREATE SCHEMA IF NOT EXISTS purchase_history;

set search_path to purchase_history;

CREATE TABLE IF NOT EXISTS users (
	id serial primary key,
	username VARCHAR(256),
	password VARCHAR(256)
);

CREATE TABLE IF NOT EXISTS shops (
	id serial primary key,
	name VARCHAR(256),
	uid integer references users (id) on delete cascade
);

CREATE TABLE IF NOT EXISTS category (
	id serial primary key,
	type VARCHAR(256),
	uid integer references users (id) on delete cascade
);

CREATE TABLE IF NOT EXISTS items (
	id serial primary key,
	tid integer references category (id) on delete cascade,
	sid integer references shops (id) on delete cascade,
	uid integer references users (id) on delete cascade,
	price numeric(10,2),
	time date
);