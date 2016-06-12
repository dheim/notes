'use strict';

let url = 'http://localhost:3000/api/note';
let client = new XMLHttpRequest();

client.open('GET', url, true);


client.onload = function () {
    let responseText = client.responseText;
    let notes = JSON.parse(responseText);
    displayNotesList(notes);
};

client.send(null);


function displayNotesList(notes) {
    var renderedNotes = getRenderedNotesList(notes);

    var notesList = document.getElementById('notesList');
    notesList.innerHTML = renderedNotes;
}

function getRenderedNotesList(notes) {
    let renderedNotes = '';

    for (let i = 0; i < notes.length; i++) {
        renderedNotes += getRenderedRow(notes[i]);
    }

    return renderedNotes;
}

function getRenderedRow(note) {
    return `<div id="notesList">
        <div class="row">
            <div class="leftCell">
                <div>${getFriendlyDate(note.due)}</div>
                <div><input type="checkbox" id="finished1" ${note.finished ? 'checked' : ''}><label for="finished1">Finished [ ${getFriendlyDate(note.finished)} ]</label></div>
            </div>
            <div class="mainCell">
                <div>${note.title} <span class="fa fa-bolt" aria-hidden="true"></span><span class="fa fa-bolt" aria-hidden="true"></span></div>
                <div>${note.content}</div>
            </div>
            <div>
                <button class="action" aria-label="edit item" onclick="location.href='form.html';" value="Show detail"><span class="fa fa-edit"></span>Show detail</button>
                <button class="action" aria-label="delete item" onclick="confirm('delete item?')" value="Delete detail"><span class="fa fa-trash"></span>Delete detail</button>
            </div>
        </div>`;
}

function getFriendlyDate(dateAsString) {
    if (!dateAsString) {
        return 'irgendwann';
    }

    let friendlyDateString;
    let date = new Date(dateAsString);
    var dayDifference = getDayDifference(date);

    if (dayDifference >= -1 && dayDifference <= 1) {
        friendlyDateString = 'heute';
    } else if (dayDifference < 7 && dayDifference > 0) {
        friendlyDateString = `nächsten ${getWeekDay(date)}`;
    } else if (dayDifference < 0 && dayDifference > -7) {
        friendlyDateString = `letzten ${getWeekDay(date)}`;
    } else {
        friendlyDateString = `${getWeekDay(date)}, ${getFormattedDate(date)}`;
    }

    return friendlyDateString;
}

function getDayDifference(date) {
    let now = new Date();

    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    var dayDifference = (date.getTime() - now.getTime()) / MS_PER_DAY;
    return dayDifference;
}

function getWeekDay(date) {
    const weekDays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return weekDays[date.getDay()];
}

function getFormattedDate(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1; //January is 0!
    let year = date.getFullYear();

    day = day < 10 ? '0' + day : day;
    month = month <10 ? '0' + month : month;

    return `${day}.${month}.${year}`;
}