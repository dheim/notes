require('font-awesome-webpack');


class List {
    constructor() {
        this.baseUrl = 'http://dev.local:3000/api/note';

        let client = new XMLHttpRequest();
        client.open('GET', this.baseUrl, true);

        let that = this;
        client.onload = function () {
            let responseText = client.responseText;
            let notes = JSON.parse(responseText);
            that.displayNotesList(notes);
            that.registerEvents();
        };

        client.send(null);
    }

    registerEvents() {
        let that = this;
        let deleteButtons = document.getElementsByName('delete-button');
        deleteButtons.forEach(function (deleteButton) {
            let id = deleteButton.getAttribute('data-note-id');
            deleteButton.addEventListener('click', function () {
                that.deleteNote(id);
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

    displayNotesList(notes) {
        var renderedNotes = this.getRenderedNotesList(notes);

        var notesList = document.getElementById('notesList');
        notesList.innerHTML = renderedNotes;
    }

    deleteNote(id) {
        let fetchOptions = {
            method: 'DELETE'
        };
        let url = `${this.baseUrl}/${id}`;

        fetch(url, fetchOptions).then(function (response) {
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
                <div>${List.getFriendlyDate(note.due)}</div>
                <div><input type="checkbox" id="finished1" ${note.finished ? 'checked' : ''}><label for="finished1">Finished [ ${List.getFriendlyDate(note.finished)} ]</label></div>
            </div>
            <div class="mainCell">
                <div>${note.title} <span class="fa fa-bolt" aria-hidden="true"></span><span class="fa fa-bolt" aria-hidden="true"></span></div>
                <div>${note.content}</div>
            </div>
            <div>
                <button name="detail-button" class="action" aria-label="edit item" value="Show detail" data-note-id="${note.id}"><span class="fa fa-edit"></span>Show detail</button>
                <button name="delete-button" class="action" aria-label="delete item" value="Delete note" data-note-id="${note.id}"><span class="fa fa-trash"></span>Delete note</button>
            </div>
        </div>`;
    }

    static getFriendlyDate(dateAsString) {
        if (!dateAsString) {
            return 'irgendwann';
        }

        let friendlyDateString;
        let date = new Date(dateAsString);
        var dayDifference = List.getDayDifference(date);

        if (dayDifference >= -1 && dayDifference <= 1) {
            friendlyDateString = 'heute';
        } else if (dayDifference < 7 && dayDifference > 0) {
            friendlyDateString = `nächsten ${List.getWeekDay(date)}`;
        } else if (dayDifference < 0 && dayDifference > -7) {
            friendlyDateString = `letzten ${List.getWeekDay(date)}`;
        } else {
            friendlyDateString = `${List.getWeekDay(date)}, ${List.getFormattedDate(date)}`;
        }

        return friendlyDateString;
    }

    static getDayDifference(date) {
        let now = new Date();

        const MS_PER_DAY = 1000 * 60 * 60 * 24;
        var dayDifference = (date.getTime() - now.getTime()) / MS_PER_DAY;
        return dayDifference;
    }

    static getWeekDay(date) {
        const weekDays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        return weekDays[date.getDay()];
    }

    static getFormattedDate(date) {
        let day = date.getDate();
        let month = date.getMonth() + 1; //January is 0!
        let year = date.getFullYear();

        day = day < 10 ? '0' + day : day;
        month = month < 10 ? '0' + month : month;

        return `${day}.${month}.${year}`;
    }
}

new List();