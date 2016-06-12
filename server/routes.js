const express = require('express');
const router  = express.Router();

const Notes = [
  {id: 1,title: 'Meine erste Notiz', content: 'Dies ist meine erste Notiz', created: new Date(), due: new Date('2016-06-10'), finished: new Date('2016-06-06')},
  {id: 2, title: 'Meine zweite Notiz', content: 'Dies ist meine zweite Notiz', created: new Date(), due: new Date(), finished: null}
];

function getIndex(id) {
  let _index = null;
  Notes.some( (note, index) => {
    if (note.id == id) {
      _index = index;
      return true;
    }
  });
  return _index;
}



router
  .get('/note', (req, res) => {
    res.json(Notes);
  })
  .get('/note/:id', (req, res) => {
    res.json(
      Notes.filter( (note) => {
        return note.id == req.params.id;
      })
    );
  })
  .post('/note', (req, res) => {
    let note = req.body;

    note.created  = new Date();
    note.finished = null;
    Notes.push(note);

    res.json(note);
  })
  .put('/note/:id', (req, res) => {
    let note = req.body;

    let noteIndex = null;
    Notes.some( (note, index) => {
      if (note.id == note.id) {
        noteIndex = index;
        return true;
      }
    });
    Notes[noteIndex] = note;

    res.json(note);

  })
  .delete('/note/:id', (req, res) => {
    let index = getIndex(req.params.id);
    let deletedNotes = Notes.splice(
      getIndex(req.params.id),
      1
    );
    res.json(deletedNotes);
  });

module.exports = router;