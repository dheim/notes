import io from 'socket.io-client';
import NoteService from './NoteService';
import 'theme/list';
require('font-awesome-webpack');
require('babel-polyfill');
require('nodep-date-input-polyfill');

let socket = io('http://dev.local:3000');

    socket.on('added', (note) => {
        listInstance.allNotes.push(note);
        listInstance.updateList();
    });
    socket.on('updated', (updatedNote) => {
        let index = listInstance.getIndexOfNote(updatedNote);

        if (index > -1) {
            listInstance.allNotes[index] = updatedNote;
            listInstance.updateList();
        }
    });
    socket.on('deleted', (id) => {
        let index = -1;
        listInstance.allNotes.some((note, i) => {
            if (note.id == id) {
                index = i;
            }
        });
        if (index > -1) {
            listInstance.allNotes.splice(index, 1);
            listInstance.updateList();
        }
    });

class List {
    constructor() {
        this.noteService = new NoteService();
        this.allNotes = [];
        this.filter = {};
        this.sorting = {};

        this.noteService.getAll()
            .then((response) => {
                response.json().then((notes) => {
                    this.initializeList(notes);
                })
            }).catch((error) => {
            // TODO show error message to the user
        });
    }

    initializeList(notes) {
        this.allNotes = notes;
        this.notesToDisplay = this.allNotes.slice();
        this.sorting = {
            sortAscending: true,
            sortBy: 'due'
        };
        this.filter = {
            displayFinished: true,
            searchTerm: ''
        };
        this.registerPageEvents();
        this.updateList();
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

        let searchTerm = this.filter.searchTerm;
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
            if (first[this.sorting.sortBy] && second[this.sorting.sortBy]) {
                ascendingOrder = first[this.sorting.sortBy] < second[this.sorting.sortBy] ? -1 : 1;
            } else {
                ascendingOrder = first[this.sorting.sortBy] ? 1 : -1;
            }

            return this.sorting.sortAscending ? ascendingOrder : -ascendingOrder;
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
        for (let sortLink of sortLinks) {
            sortLink.addEventListener('click', () => {
                let sortBy = sortLink.getAttribute('data-sort-by');
                if (sortBy == this.sorting.sortBy) {
                    this.sorting.sortAscending = !this.sorting.sortAscending;
                } else {
                    this.sorting.sortBy = sortBy;
                    this.sorting.sortAscending = true;
                }
            });
        }

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
        for (let deleteLink of deleteLinks) {
            let noteId = deleteLink.getAttribute('data-note-id');
            deleteLink.addEventListener('click', () => {
                this.deleteNote(noteId);
            });
        }

        let finishedCheckboxes = document.getElementsByName('finished-checkbox');
        for (let finishedCheckbox of finishedCheckboxes) {
            let noteId = parseInt(finishedCheckbox.getAttribute('data-note-id'));
            finishedCheckbox.addEventListener('click', () => {
                let finishDate;

                if (finishedCheckbox.checked) {
                    let today = finishedCheckbox.checked ? new Date() : null;
                    let dateParts = this.getDateParts(today);
                    finishDate = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
                } else {
                    finishDate = null;
                }

                this.updateFinishedDate(noteId, finishDate);
            });
        }
    }

    updateFinishedDate(noteId, finished) {
        let note = this.getNoteById(noteId);
        note.finished = finished;
        this.updateNote(note);
    }

    updateNote(note) {
        this.noteService.save(note).then((response) => {
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
        for (let sortButton of sortButtons) {
            let cssClass;

            if (sortButton.getAttribute('data-sort-by') == this.sorting.sortBy) {
                cssClass = this.sorting.sortAscending ? 'fa-sort-asc' : 'fa-sort-desc';
            } else {
                cssClass = 'fa-sort';
            }

            let sortingIcon = sortButton.querySelectorAll("[name=sorting-icon]")[0];

            if (sortingIcon) {
                this.replaceSortingCssClass(sortingIcon, ' ' + cssClass);
            }
        }
    }

    replaceSortingCssClass(element, newCssClass) {
        // element.classList.*
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
        this.noteService.deleteNote(id).then((response) => {
            
        }).catch((error) => {
            // TODO show error message to the user
        });
    }

    getRenderedNotesList(notes) {
        let renderedNotes = '';

        for (let note of notes) {
            renderedNotes += this.getRenderedRow(note);
        }

        return renderedNotes;
    }

    getRenderedRow(note) {
        let importanceHtml = [];
        const importanceTpl = `<span class="fa fa-bolt" aria-hidden="true"></span>`;
        for (let i = 0; i < note.importance; i++) {
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
        let dateParts = this.getDateParts(date);
        return `${dateParts.day}.${dateParts.month}.${dateParts.year}`;
    }

    getDateParts(date) {
        let day = date.getDate();
        let month = date.getMonth() + 1; //January is 0!
        let year = date.getFullYear();

        day = day < 10 ? '0' + day : day;
        month = month < 10 ? '0' + month : month;

        return {
            day: day,
            month: month,
            year: year
        }
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

const listInstance = new List();

