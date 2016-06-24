const express = require('express');
const Note    = require('./note');

let noteRouter = (app) => {
  const router  = express.Router();
  const note    = new Note();

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
          app.io.sockets.emit('added', row);
          res.json(row);
        });
      });
    })
    .put('/note/:id', (req, res) => {
      note.update(req.body).then( (lastId) => {
        note.get(lastId).then( (row) => {
          app.io.sockets.emit('updated', row);
          res.json(row);
        });
      });
    })
    .delete('/note/:id', (req, res) => {
      note.delete(req.params.id).then( (lastId) => {
        app.io.sockets.emit('deleted', lastId);
        res.json(lastId);
      });
    });

  return router;
};

module.exports = noteRouter;