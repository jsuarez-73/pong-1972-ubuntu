import { Database } from "./../src/sqlite";

const db = new Database();

db.exec(`
  CREATE TABLE users(
    id INTEGER PRIMARY KEY,
    name TEXT,
	email TEXT
  ) STRICT
`);

// Array anonymousParameters --------------------------------------------------
let sql = `
	INSERT INTO users (
		name,
		email
	) VALUES (
		?, ?
	)
`;

const query1 = db.prepare(sql);
query1.run(['Alice', 'alice@example.com']);

sql = '';
sql = `
	SELECT 
		*
	FROM users
	WHERE
		name = ?
`;
const query2 = db.prepare(sql);
const user1 = query2.get(['Alice']);

console.log(user1, '\n');

// Object used to bind named parameters ---------------------------------------
const obj1 = {
	email: 'camilo@test.com',
	name: 'Camilo'
}

// INSERT STRUCTURE
sql = '';
sql = `
	INSERT INTO users (
		name,
		email
	) VALUES (
		$name,
		$email
	)
`;
const query3 = db.prepare(sql);
const inserted = query3.insert(obj1);
if (inserted)
	console.log(inserted, 'An user have been added using the insert() method.\n');

// SELECT STRUCTURE
sql = '';
sql = `
	SELECT 
		* 
	FROM users
	WHERE
		name = $name
`;
const query4 = db.prepare(sql);
const user2 = query4.select({name: 'Camilo'});
console.log(user2, '\n');

sql = '';
sql = `
	SELECT 
		name 
	FROM users
	WHERE
		name = $name
`;
const query5 = db.prepare(sql);
const user3 = query5.select({name: 'Diego'});
console.log('Diego do not exist -> ', user3, '\n');

// SELECT ALL STRUCTURE
sql = '';
sql = `
	SELECT 
		* 
	FROM users
`;
const query6 = db.prepare(sql);
let users = query6.selectAll();
console.log(users, '\n');

// UPDATE STRUCTURE
sql = '';
sql = `
	UPDATE users
	SET 
		email = :mail
	WHERE
		id = :id
`;
const query7 = db.prepare(sql);
const updated = query7.update({id: 2, mail: 'milo@example.com'});
if (updated)
	console.log(updated, 'User update()', '\n');

// DELETE STRUCTURE
sql = '';
sql = `
	DELETE FROM users
	WHERE
		email = @email
`;
const query8 = db.prepare(sql);
const deleted = query8.delete({email: 'milo@example.com'});
if (deleted)
	console.log(deleted, 'User delete()', '\n');

users = query6.selectAll();
console.log(users, '\n');

db.close();
