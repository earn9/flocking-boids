
const storageAvailable = function() {
    const result = typeof(Storage) !== 'undefined';
    if (!result) {
        console.log('no storage available');
    }
    return result;
}();

const boolFromString = (input) => {
    return input === 'true';
};

const boolFromStorage = (storageKey) => {
    return boolFromString(localStorage.getItem(storageKey));
};

export const initializeConfig = (config) => {
    if (storageAvailable) {
        Object.keys(config).forEach(key => config[key] = boolFromStorage(key));
    } 
};

export const storeConfigChanges = (config) => {
    if (storageAvailable) {
        Object.keys(config).forEach(key => localStorage.setItem(key, config[key]));
    }
};
