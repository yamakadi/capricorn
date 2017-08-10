export class LocalStorage {

    constructor(localStorage) {
        this.ls = localStorage;
    }

    clear() {
        this.ls.clear();
    }

    exists(key) {
        return !!this.ls.getItem(key);
    }

    get(key, placeholder = null) {
        if (this.exists(key)) {
            return JSON.parse(this.ls.getItem(key));
        }

        return placeholder;
    }

    remove(key) {
        this.ls.removeItem(key);
    }

    set(key, value) {
        this.ls.setItem(key, JSON.stringify(value));
    }

}

export default new LocalStorage(window.localStorage);