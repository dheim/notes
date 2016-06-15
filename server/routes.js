const express = require('express');
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
      db.run('INSERT INTO notes (title, description, due, finished) VALUES ($title, $description, $due, $finished)', {
        $title: note.title,
        $description: note.description,
        $due: (note.due) ? note.due : null,
        $finished: (note.finished) ? note.finished : null
      }, (err) => {
        if (err) reject(err);
        resolve(this.lastID);
      });
    });
  }

  update(note) {
    return new Promise( (resolve, reject) => {
      db.run('UPDATE notes SET title = $title, description = $description, due = $due, finished = $finished WHERE id = $id', {
        $id: note.id,
        $title: note.title,
        $description: note.description,
        $due: (note.due) ? note.due : null,
        $finished: (note.finished) ? note.finished : null
      }, (err) => {
        if (err) reject(err);
        resolve(this.lastID);
      });
    });
  }

  delete(id) {
    return new Promise( (resolve, reject) => {
      db.run('DELETE FROM notes WHERE id = $id', {
        $id: id
      }, (err) => {
        if (err) reject(err);
        resolve(this.lastID);
      });
    });
  }

}        


let noteRouter = (app) => {
  const router  = express.Router();
  const note = new Note();

  app.io.on('connection', (socket) => {
  });

  router
    .get('/note', (req, res) => {
      note.get().then( (rows) => {
        res.json(rows);
      });
    })
    .get('/note/:id', (req, res) => {
      note.get(req.params.id).then( (rows) => {
        res.json(rows);
      });
    })
    .post('/note', (req, res) => {
      note.add(req.body).then( (lastId) => {
        note.get(lastId).then( (row) => {
          res.json(row);
        });
      }).catch( (err) => {
        console.log(err);
      });
    })
    .put('/note/:id', (req, res) => {
      note.update(req.body).then( (lastId) => {
        note.get(lastId).then( (row) => {
          res.json(row);
        });
      });
    })
    .delete('/note/:id', (req, res) => {
      note.delete(req.params.id).then( (lastId) => {
        res.json(lastId);
      });
    });

  return router;
};

module.exports = noteRouter;