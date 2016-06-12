const config  = require('./config');
const sqlite  = require('sqlite3');
const path    = require('path');

const db      = new sqlite.Database(path.join(__dirname, config.db));

db.run('drop table notes');

db.run(`create table notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due DATETIME NULL,
  finished DATETIME NULL
)`);


db.run(`INSERT INTO notes
  (title, description, due, finished)
  VALUES
  ('Meine erste Notiz', 'Dies ist meine erste Notiz', NULL, NULL)
`);

db.run(`INSERT INTO notes
  (title, description, due, finished)
  VALUES
  ('Meine zweite Notiz', 'Dies ist meine zweite Notiz', NULL, NULL)
`);