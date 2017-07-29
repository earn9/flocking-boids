import { JSONLoader } from 'three';

const loadAsync = (loader, url, onProgress = () => {}) => {
    return new Promise((resolve, reject) => {
        loader.load(url, (geometry, materials) => {
            resolve({ geometry, materials });
        },
        request => onProgress(url, request.loaded, request.total), 
        err => reject({ url, err }));
    });
};

const noDecimal = (number) => {
    return number.toFixed(0);
};

const loadResourceAsync = (loader, url, onSuccess) => {
    return loadAsync(loader, url,
            (url, loaded, total) => console.log(`loading ${url}: ${noDecimal(loaded/total * 100)}%`))
        .then(loadedData => onSuccess(loadedData))
        .catch(err => console.log(`error loading "${url}"`, JSON.stringify(err)));    
};

const loadAllResources = (resources) => {
    const loader = new JSONLoader();
    
    return Promise.all(resources.map(x => loadResourceAsync(loader, x.url, x.onSuccess)));
};

export default loadAllResources;