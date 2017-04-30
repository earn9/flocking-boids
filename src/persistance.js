
const storageAvailable = typeof(Storage) !== 'undefined';

const boolFromString = (input) => {
    return input == 'true';
};

const boolFromStorage = (storageKey) => {
    return boolFromString(localStorage.getItem(storageKey));
};

export const initializeConfig = (config) => {
    if (storageAvailable) {
        Object.keys(config).forEach(key => config[key] = boolFromStorage(key));
    } else {
        console.log('no storage available');
    }
};

export const storeConfigChanges = (config) => {
    if (storageAvailable) {
        Object.keys(config).forEach(key => localStorage.setItem(key, config[key]));
    } else {
        console.log('no storage available');
    }
};