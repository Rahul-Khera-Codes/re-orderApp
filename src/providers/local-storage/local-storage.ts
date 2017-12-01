import {Injectable} from '@angular/core';
@Injectable()
export class LocalStorageProvider {

    constructor() {}
    setLocalStorageData(storageName, storageData) {
        if (typeof storageData == "string") {
            localStorage.setItem(storageName, storageData);
        } else {
            localStorage.setItem(storageName, JSON.stringify(storageData));
        }
    }
    getLocalStorageData(storageName) {
        return localStorage.getItem(storageName);
    }
    removeLocalStorageData(storageName) {
        localStorage.removeItem(storageName);
    }
    resetLocalStorageData(storageName) {
        localStorage.clear();
    }
}
