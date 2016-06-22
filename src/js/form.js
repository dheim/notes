class Form {

    constructor() {
        this.baseUrl = 'http://dev.local:3000/api/note';

        this.formElements = {
            title: document.getElementById('title'),
            description: document.getElementById('description'),
            due: document.getElementById('due'),
            finished: document.getElementById('finished')
        };

        this.registerEvents();

        let id = this.getUrlQueryParameter('id');
        if (id) {
            this.loadNote(id);
        } else {
            this.note = {};
        }
    }

    registerEvents() {
        let saveButton = document.getElementById('saveButton');
        saveButton.addEventListener('click', () => {
            this.saveNote();
        });

        let saveAndCloseButton = document.getElementById('saveAndCloseButton');
        saveAndCloseButton.addEventListener('click', () => {
            this.saveNote();
            window.location.href = 'index.html';
        });

        let cancelButton = document.getElementById('cancelButton');
        cancelButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    loadNote(id) {
        fetch(`${this.baseUrl}/${id}`)
            .then((response) => {
                if (response.ok) {
                    response.json().then((note) => {
                        this.note = note;
                        this.applyNoteToForm();
                    })
                } else {
                    // FIXME show error message to the user
                    console.log('error fetching note');
                }
            });
    }

    applyNoteToForm() {
        for (let key in this.formElements) {
            if (this.formElements.hasOwnProperty(key) && this.note[key]) {
                this.formElements[key].value = this.note[key];
            }
        }
    }

    applyFormDataToNote() {
        for (let key in this.formElements) {
            if (this.formElements.hasOwnProperty(key) && this.formElements[key].value) {
                this.note[key] = this.formElements[key].value;
            }
        }
    }

    saveNote() {
        this.applyFormDataToNote();

        let fetchOptions = this.createFetchOptions(this.note);
        let url = this.createUrl(this.baseUrl, fetchOptions, this.note);

        fetch(url, fetchOptions)
            .then((response) => {
                if (response.ok) {
                    return response.json().then((note) => {
                        this.applyNoteToForm(note);
                    })
                } else {
                    // FIXME show error message to the user
                }
            });
    }

    createFetchOptions(entity) {
        let httpMethod = entity.id ? 'PUT' : 'POST';
        let noteJson = JSON.stringify(entity);

        return {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: httpMethod,
            body: noteJson
        };
    }

    createUrl(baseUrl, fetchOptions, entity) {
        if (fetchOptions.method == 'PUT') {
            return `${baseUrl}/${entity.id}`;
        } else {
            return baseUrl;
        }
    }

    getUrlQueryParameter(name) {
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