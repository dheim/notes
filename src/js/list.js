import io from 'socket.io-client';
import NoteService from './NoteService';
import 'theme/list';
require('font-awesome-webpack');

let socket = io('http://dev.local:3000/api');

socket.on('added', (note) => {
    if (this.allNotes) {
        this.allNotes.push(note);
        this.updateList();
    }
});
socket.on('updated', (updatedNote) => {
    if (this.allNotes) {
        var index = this.getIndexOfNote(updatedNote);

        if (index > -1) {
            this.allNotes[i] = updatedNote;
            this.updateList();
        }
    }
});
socket.on('deleted', (note) => {
    if (this.allNotes) {
        var index = this.getIndexOfNote(note);

        if (index > -1) {
            this.allNotes.splice(index, 1)
            this.updateList();
        }
    }
});

class List {
    constructor() {
        this.baseUrl = 'http://dev.local:3000/api/note';

        let client = new XMLHttpRequest();
        client.open('GET', this.baseUrl, true);

        client.onload = () => {
            let responseText = client.responseText;
            this.allNotes = JSON.parse(responseText);
            this.notesToDisplay = this.allNotes.slice();
            this.sortAscending = true;
            this.sortBy = 'due';
            this.filter = {
                displayFinished: true,
                searchTerm: ''
            };
            this.registerPageEvents();
            this.updateList();
        };

        client.send(null);
    }

    updateList() {
        this.applyFilters();
        this.sortList();
        this.renderList();
    }

    applyFilters() {
        this.notesToDisplay = this.allNotes.filter((note) => {
            return this.filter.displayFinished || !note.finished;
        });

        var searchTerm = this.filter.searchTerm;
        if (searchTerm) {
            searchTerm = searchTerm.toLowerCase();
            this.notesToDisplay = this.allNotes.filter((note) => {
                return note.title.toLowerCase().indexOf(searchTerm) >= 0 || note.description.toLowerCase().indexOf(searchTerm) >= 0;
            });
        }
    }

    sortList() {
        this.notesToDisplay.sort((first, second) => {
            let ascendingOrder;
            if (first[this.sortBy] && second[this.sortBy]) {
                ascendingOrder = first[this.sortBy] < second[this.sortBy] ? -1 : 1;
            } else {
                ascendingOrder = first[this.sortBy] ? 1 : -1;
            }

            return this.sortAscending ? ascendingOrder : -ascendingOrder;
        });

        this.updateSortButtonIcons();
        this.renderList();
    }

    renderList() {
        let renderedNotes = this.getRenderedNotesList(this.notesToDisplay);

        let notesList = document.getElementById('notesListBody');
        notesList.innerHTML = renderedNotes;

        this.registerListEvents();
    }

    registerPageEvents() {
        let sortLinks = document.getElementsByName('sort-link');
        sortLinks.forEach((sortLink) => {
            sortLink.addEventListener('click', () => {
                let sortBy = sortLink.getAttribute('data-sort-by');

                if (sortBy == this.sortBy) {
                    this.sortAscending = !this.sortAscending;
                } else {
                    this.sortBy = sortBy;
                    this.sortAscending = true;
                }
                this.updateList();
            });
        });

        let showFinishedCheckbox = document.getElementById('show-finished-checkbox');
        showFinishedCheckbox.addEventListener('click', () => {
            let showFinished = showFinishedCheckbox.checked;
            this.filterByFinishedState(showFinished);
        });

        let searchInput = document.getElementById('search');
        search.addEventListener('keyup', () => {
            let searchTerm = searchInput.value;
            this.filterBySearchTerm(searchTerm);
        });
    }

    registerListEvents() {
        let deleteLinks = document.getElementsByName('delete-link');
        deleteLinks.forEach((deleteLink) => {
            let noteId = deleteLink.getAttribute('data-note-id');
            deleteLink.addEventListener('click', () => {
                this.deleteNote(noteId);
            });
        });

        let finishedCheckboxes = document.getElementsByName('finished-checkbox');
        finishedCheckboxes.forEach((finishedCheckbox) => {
            let noteId = parseInt(finishedCheckbox.getAttribute('data-note-id'));
            finishedCheckbox.addEventListener('click', () => {
                let finished = finishedCheckbox.checked ? new Date() : null;
                this.updateFinishedDate(noteId, finished);
            });
        });
    }

    updateFinishedDate(noteId, finished) {
        let note = this.getNoteById(noteId);
        note.finished = finished;
        this.updateNote(note);
    }

    updateNote(note) {
        var noteService = new NoteService();
        noteService.save(note).then((response) => {
            if (response.ok) {
                return response.json().then(() => {
                    this.updateList();
                })
            } else {
                // FIXME show error message to the user
            }
        });
    }

    updateSortButtonIcons() {
        let sortButtons = document.getElementsByName('sort-link');
        sortButtons.forEach((sortButton) => {
            let cssClass;

            if (sortButton.getAttribute('data-sort-by') == this.sortBy) {
                cssClass = this.sortAscending ? 'fa-sort-asc' : 'fa-sort-desc';
            } else {
                cssClass = 'fa-sort';
            }

            var sortingIcon = sortButton.querySelectorAll("[name=sorting-icon]")[0];

            if (sortingIcon) {
                this.replaceSortingCssClass(sortingIcon, ' ' + cssClass);
            }
        });
    }

    replaceSortingCssClass(element, newCssClass) {
        element.className = element.className.replace(/(?:^|\s)fa-sort\S*/g, newCssClass);
    }

    filterByFinishedState(displayFinished) {
        this.filter.displayFinished = displayFinished;
        this.updateList();
    }

    filterBySearchTerm(searchTerm) {
        this.filter.searchTerm = searchTerm;
        this.updateList();
    }

    deleteNote(id) {
        let fetchOptions = {
            method: 'DELETE'
        };
        let url = `${this.baseUrl}/${id}`;

        fetch(url, fetchOptions).then((response) => {
            if (!response.ok) {
                // TODO show error message to the user
            }
        });
    }

    getRenderedNotesList(notes) {
        let renderedNotes = '';

        for (let i = 0; i < notes.length; i++) {
            renderedNotes += this.getRenderedRow(notes[i]);
        }

        return renderedNotes;
    }

    getRenderedRow(note) {

        let importanceHtml = [];
        const importanceTpl = `<span class="fa fa-bolt" aria-hidden="true"></span>`;
        for (let i = 0; i<note.importance;i++) {
            importanceHtml.push(importanceTpl);
        }

        return `<tr>
            <td>
                <div class="due">${this.getFriendlyDate(note.due)}</div>
                <div><input type="checkbox" name="finished-checkbox" data-note-id="${note.id}" ${note.finished ? 'checked' : ''}><label for="finished1">Finished ${note.finished ? '[' + this.getFriendlyDate(note.finished) + ']' : ''}</label></div>
            </td>
            <td class="description">
                <div    class="title">${note.title} ${importanceHtml.join('')}</div>
                <div>${this.getDescription(note.description)}</div>
            </td>
            <td class="icons">
                <a href="form.html?id=${note.id}" class="action" aria-label="edit item" title="Show detail"><span class="fa fa-edit"></span></a>
                <a href="#" name="delete-link" class="action" aria-label="delete item" title="Delete note" data-note-id="${note.id}"><span class="fa fa-trash"></span></a>
            </td>
          </tr>`;
    }

    getDescription(description) {
        return description.replace(/(?:\r\n|\r|\n)/g, '<br>');
    }

    getFriendlyDate(dateAsString) {
        if (!dateAsString) {
            return 'irgendwann';
        }

        let friendlyDateString;
        let date = new Date(dateAsString);
        let dayDifference = this.getDayDifference(date);

        if (dayDifference >= -1 && dayDifference <= 1) {
            friendlyDateString = 'heute';
        } else if (dayDifference < 7 && dayDifference > 0) {
            friendlyDateString = `nächsten ${this.getWeekDay(date)}`;
        } else if (dayDifference < 0 && dayDifference > -7) {
            friendlyDateString = `letzten ${this.getWeekDay(date)}`;
        } else {
            friendlyDateString = `${this.getWeekDay(date)}, ${this.getFormattedDate(date)}`;
        }

        return friendlyDateString;
    }

    getDayDifference(date) {
        let now = new Date();

        const MS_PER_DAY = 1000 * 60 * 60 * 24;
        let dayDifference = (date.getTime() - now.getTime()) / MS_PER_DAY;
        return dayDifference;
    }

    getWeekDay(date) {
        const weekDays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        return weekDays[date.getDay()];
    }

    getFormattedDate(date) {
        let day = date.getDate();
        let month = date.getMonth() + 1; //January is 0!
        let year = date.getFullYear();

        day = day < 10 ? '0' + day : day;
        month = month < 10 ? '0' + month : month;

        return `${day}.${month}.${year}`;
    }

    getIndexOfNote(note) {
        for (let i = 0; i < this.allNotes.length; i++) {
            if (this.allNotes[i].id === note.id) {
                return i;
            }
        }

        return -1;
    }

    getNoteById(id) {
        for (let i = 0; i < this.allNotes.length; i++) {
            if (this.allNotes[i].id === id) {
                return this.allNotes[i];
            }
        }
    }
}

new List();