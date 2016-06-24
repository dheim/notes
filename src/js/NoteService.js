class NoteService {
    constructor() {
        this.baseUrl = 'http://dev.local:3000/api/note';
    }

    save(note) {
        let fetchOptions = this.createFetchOptions(note);
        let url = this.createUrl(fetchOptions, note);
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