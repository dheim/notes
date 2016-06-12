class Form {

    constructor() {
        this.baseUrl = 'http://localhost:3000/api/note';

        this.formElements = {
            title: document.getElementById('title'),
            description: document.getElementById('description'),
            due: document.getElementById('due')
        };

        this.registerEvents();

        let id = Form.getUrlQueryParameter('id');
        if (id) {
            this.loadNote(id);
        } else {
            this.note = {};
        }
    }

    registerEvents() {
        let that = this;
        var saveButton = document.getElementById('saveButton');
        saveButton.addEventListener('click', function (event) {
            that.saveNote();
        });
    }

    loadNote(id) {
        let that = this;
        fetch(`${that.baseUrl}/${id}`)
            .then(function (response) {
                if (response.ok) {
                    response.json().then(function (note) {
                        that.note = note;
                        that.applyNoteToForm();
                    })
                } else {
                    // FIXME show error message to the user
                    console.log('error fetching note');
                }
            });
    }

    applyNoteToForm() {
        let that = this;
        for (var key in this.formElements) {
            if (this.formElements.hasOwnProperty(key) && that.note[key]) {
                this.formElements[key].value = that.note[key];
            }
        }
    }

    applyFormDataToNote() {
        for (var key in this.formElements) {
            if (this.formElements.hasOwnProperty(key) && this.formElements[key].value) {
                this.note[key] = this.formElements[key].value;
            }
        }
    }

    saveNote() {
        let that = this;
        this.applyFormDataToNote();

        let fetchOptions = Form.createFetchOptions(that.note);
        let url = Form.createUrl(that.baseUrl, fetchOptions, that.note);

        fetch(url, fetchOptions)
            .then(function (response) {
                if (response.ok) {
                    return response.json().then(function (note) {
                        that.applyNoteToForm(note);
                    })
                } else {
                    // FIXME show error message to the user
                }
            });
    }

    static createFetchOptions(entity) {
        let httpMethod = entity.id ? 'PUT' : 'POST';
        var noteJson = JSON.stringify(entity);

        return {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: httpMethod,
            body: noteJson
        };
    }

    static createUrl(baseUrl, fetchOptions, entity) {
        if (fetchOptions.method == 'PUT') {
            return `${baseUrl}/${entity.id}`;
        } else {
            return baseUrl;
        }
    }

    static getUrlQueryParameter(name) {
        let url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
}

new Form();