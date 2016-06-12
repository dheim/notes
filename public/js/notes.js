/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	var url = 'http://localhost:3000/api/note';
	var client = new XMLHttpRequest();

	client.open('GET', url, true);

	client.onload = function () {
	    var responseText = client.responseText;
	    var notes = JSON.parse(responseText);
	    displayNotesList(notes);
	};

	client.send(null);

	function displayNotesList(notes) {
	    var renderedNotes = getRenderedNotesList(notes);

	    var notesList = document.getElementById('notesList');
	    notesList.innerHTML = renderedNotes;
	}

	function getRenderedNotesList(notes) {
	    var renderedNotes = '';

	    for (var i = 0; i < notes.length; i++) {
	        renderedNotes += getRenderedRow(notes[i]);
	    }

	    return renderedNotes;
	}

	function getRenderedRow(note) {
	    return '<div id="notesList">\n        <div class="row">\n            <div class="leftCell">\n                <div>' + getFriendlyDate(note.due) + '</div>\n                <div><input type="checkbox" id="finished1" ' + (note.finished ? 'checked' : '') + '><label for="finished1">Finished [ ' + getFriendlyDate(note.finished) + ' ]</label></div>\n            </div>\n            <div class="mainCell">\n                <div>' + note.title + ' <span class="fa fa-bolt" aria-hidden="true"></span><span class="fa fa-bolt" aria-hidden="true"></span></div>\n                <div>' + note.content + '</div>\n            </div>\n            <div>\n                <button class="action" aria-label="edit item" onclick="location.href=\'form.html\';" value="Show detail"><span class="fa fa-edit"></span>Show detail</button>\n                <button class="action" aria-label="delete item" onclick="confirm(\'delete item?\')" value="Delete detail"><span class="fa fa-trash"></span>Delete detail</button>\n            </div>\n        </div>';
	}

	function getFriendlyDate(dateAsString) {
	    if (!dateAsString) {
	        return 'irgendwann';
	    }

	    var friendlyDateString = void 0;
	    var date = new Date(dateAsString);
	    var dayDifference = getDayDifference(date);

	    if (dayDifference >= -1 && dayDifference <= 1) {
	        friendlyDateString = 'heute';
	    } else if (dayDifference < 7 && dayDifference > 0) {
	        friendlyDateString = 'nächsten ' + getWeekDay(date);
	    } else if (dayDifference < 0 && dayDifference > -7) {
	        friendlyDateString = 'letzten ' + getWeekDay(date);
	    } else {
	        friendlyDateString = getWeekDay(date) + ', ' + getFormattedDate(date);
	    }

	    return friendlyDateString;
	}

	function getDayDifference(date) {
	    var now = new Date();

	    var MS_PER_DAY = 1000 * 60 * 60 * 24;
	    var dayDifference = (date.getTime() - now.getTime()) / MS_PER_DAY;
	    return dayDifference;
	}

	function getWeekDay(date) {
	    var weekDays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
	    return weekDays[date.getDay()];
	}

	function getFormattedDate(date) {
	    var day = date.getDate();
	    var month = date.getMonth() + 1; //January is 0!
	    var year = date.getFullYear();

	    day = day < 10 ? '0' + day : day;
	    month = month < 10 ? '0' + month : month;

	    return day + '.' + month + '.' + year;
	}

/***/ }
/******/ ]);