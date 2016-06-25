require('whatwg-fetch');

class NoteService {
    constructor() {
        this.baseUrl = 'http://dev.local:3000/api/note';
    }

    get(id) {
        return fetch(`${this.baseUrl}/${id}`);
    }

    getAll() {
        return fetch(this.baseUrl);
    }

    save(note) {
        let fetchOptions = this.createFetchOptions(note);
        let url = this.createUrl(fetchOptions, note);
        return fetch(url, fetchOptions);
    }

    deleteNote(id) {
        let fetchOptions = {
            method: 'DELETE'
        };
        let url = `${this.baseUrl}/${id}`;

        return fetch(url, fetchOptions);
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

    createUrl(fetchOptions, entity) {
        if (fetchOptions.method == 'PUT') {
            return `${this.baseUrl}/${entity.id}`;
        } else {
            return this.baseUrl;
        }
    }
}

export default NoteService;