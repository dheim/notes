const config  = require('./config');
const sqlite  = require('sqlite3');
const path    = require('path');
const db      = new sqlite.Database(path.join(__dirname, config.db));


class Note {

  get(id = null) {
    return new Promise( (resolve, reject) => {
      if (id > 0) {
        db.get('SELECT * FROM notes WHERE id = ?', id, (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      } else {
        db.all('SELECT * FROM notes', (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }
    });
  }

  add(note) {
    return new Promise( (resolve, reject) => {
      db.run('INSERT INTO notes (title, description, due, finished, importance) VALUES ($title, $description, $due, $finished, $importance)', {
        $title: note.title,
        $description: note.description,
        $due: (note.due) ? note.due : null,
        $finished: (note.finished) ? note.finished : null,
        $importance: note.importance
      }, function (err) {
        if (err) reject(err);
        resolve(this.lastID);
      });
    });
  }

  update(note) {
    return new Promise( (resolve, reject) => {
      db.run('UPDATE notes SET title = $title, description = $description, due = $due, finished = $finished, importance = $importance WHERE id = $id', {
        $id: note.id,
        $title: note.title,
        $description: note.description,
        $due: (note.due) ? note.due : null,
        $finished: (note.finished) ? note.finished : null,
        $importance: note.importance
      }, function (err) {
        if (err) reject(err);
        resolve(note.id);
      });
    });
  }

  delete(id) {
    return new Promise( (resolve, reject) => {
      db.run('DELETE FROM notes WHERE id = $id', {
        $id: id
      }, function (err) {
        if (err) reject(err);
        resolve(id);
      });
    });
  }

}

module.exports = Note;