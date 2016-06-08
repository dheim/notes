const express = require('express');
const router  = express.Router();
const config  = require('./config');
const sqlite  = require('sqlite3');
const path    = require('path');

const db      = new sqlite.Database(path.join(__dirname, config.db));            

router
  .get('/note', (req, res) => {
    db.all('select * from notes', (err, rows) => {
      res.json(rows);
    });
  })
  .get('/note/:id', (req, res) => {
    db.get(`select * from notes where id = ${req.params.id}`, (err, row) => {
      res.json(row);
    });
  })
  .post('/note', (req, res) => {
    let note = req.body;

    db.run(`insert into notes (title, description, due, finished) VALUES ($title, $description, $due, $finished)`, {
      $title: note.title,
      $description: note.description,
      due: (note.due) ? note.due : null,
      finished: (note.finished) ? note.finished : null
    }, function (err) {
      res.json(this.changes);
    });
  })
  .put('/note/:id', (req, res) => {
    let note = req.body;

    db.run(`update notes
      set title = $title,
          description = $description,
          due = $due,
          finished = $finished
    where id = $id`, {
      $id: note.id,
      $title: note.title,
      $description: note.description,
      due: (note.due) ? note.due : null,
      finished: (note.finished) ? note.finished : null
    }, function (err) {
      if(err) throw new Error(err);
      res.json(this.changes);
    });

  })
  .delete('/note/:id', (req, res) => {
    db.run('delete from notes where id = $id', {$id: req.params.id}, function (err) => {
      if(err) throw new Error(err);
      res.json(this.changes);
    });
  });

module.exports = router;