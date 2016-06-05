require('font-awesome-webpack');

import Notes from './mock.notes';

class List {
  constructor() {
    //this.renderNotes();
  }

  renderNotes() {
    let el        = document.getElementById('notes');
    let template = `${Notes.each((note) => {

      return `<div class="note">
        <span>${note.title}</span>
      </div>`;
    
    })}`;

    console.log(template);
  }
}


new List();