require('font-awesome-webpack');
import io from 'socket.io-client';

let socket = io('http://dev.local:3000/api');

socket.on('added', (note) => {
});
socket.on('updated', (note) => {
});
socket.on('deleted', (note) => {
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
            this.sortNotes('due');
            this.displayNotesList();
            this.registerPageEvents();
        };

        client.send(null);
    }

    registerPageEvents() {
        let sortButtons = document.getElementsByName('sort-button');
        sortButtons.forEach((sortButton) => {
            sortButton.addEventListener('click', () => {
                let sortBy = sortButton.getAttribute('data-sort-by');
                this.sortNotes(sortBy);
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
        let deleteButtons = document.getElementsByName('delete-button');
        deleteButtons.forEach((deleteButton) => {
            let noteId = deleteButton.getAttribute('data-note-id');
            deleteButton.addEventListener('click', () => {
                this.deleteNote(noteId);
            });
        });

        let detailButtons = document.getElementsByName('detail-button');
        detailButtons.forEach(function (detailButton) {
            let id = detailButton.getAttribute('data-note-id');
            detailButton.addEventListener('click', function () {
                location.href = `form.html?id=${id}`;
            });
        });
    }

    updateSortButtonIcons() {
        let sortButtons = document.getElementsByName('sort-button');
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

    displayNotesList() {
        let renderedNotes = this.getRenderedNotesList(this.notesToDisplay);

        let notesList = document.getElementById('notesList');
        notesList.innerHTML = renderedNotes;

        this.registerListEvents();
    }

    sortNotes(sortBy) {
        if (this.sortBy == sortBy) {
            this.sortAscending = !this.sortAscending;
        } else {
            this.sortAscending = true;
        }

        this.sortBy = sortBy;

        this.notesToDisplay.sort((first, second) => {
            let ascendingOrder;
            if (first[sortBy] && second[sortBy]) {
                ascendingOrder = first[sortBy] < second[sortBy] ? -1 : 1;
            } else {
                ascendingOrder = first[sortBy] ? 1 : -1;
            }

            return this.sortAscending ? ascendingOrder : -ascendingOrder;
        });

        this.updateSortButtonIcons();
        this.displayNotesList();
    }

    filterByFinishedState(displayFinished) {
        this.notesToDisplay = this.allNotes.filter((note) => {
            return displayFinished || !note.finished;
        });
        this.sortNotes(this.sortBy);
        this.displayNotesList();
    }

    filterBySearchTerm(text) {
        this.notesToDisplay = this.allNotes.filter((note) => {
            return note.title.indexOf(text) >= 0 || note.description.indexOf(text) >= 0;
        });

        this.sortNotes(this.sortBy);
        this.displayNotesList();
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
        return `<div id="notesList">
        <div class="row">
            <div class="leftCell">
                <div>${this.getFriendlyDate(note.due)}</div>
                <div><input type="checkbox" id="finished1" ${note.finished ? 'checked' : ''}><label for="finished1">Finished [ ${this.getFriendlyDate(note.finished)} ]</label></div>
            </div>
            <div class="mainCell">
                <div>${note.title} <span class="fa fa-bolt" aria-hidden="true"></span><span class="fa fa-bolt" aria-hidden="true"></span></div>
                <div>${note.description}</div>
            </div>
            <div>
                <button name="detail-button" class="action" aria-label="edit item" value="Show detail" data-note-id="${note.id}"><span class="fa fa-edit"></span>Show detail</button>
                <button name="delete-button" class="action" aria-label="delete item" value="Delete note" data-note-id="${note.id}"><span class="fa fa-trash"></span>Delete note</button>
            </div>
        </div>`;
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
}

new List();