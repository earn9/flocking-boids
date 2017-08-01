import { JSONLoader } from 'three';

const loadAsync = (loader, name, url, onProgress = () => {}) => {
    return new Promise((resolve, reject) => {
        loader.load(url, (geometry, materials) => {
            resolve({ name, geometry, materials });
        },
        request => onProgress(url, request.loaded, request.total), 
        err => reject({ url, err }));
    });
};

const noDecimal = (number) => {
    return number.toFixed(0);
};

const loadResourceAsync = (loader, name, url) => {
    return loadAsync(
            loader, 
            name,
            url,
            (url, loaded, total) => console.log(`loading ${url}: ${noDecimal(loaded/total * 100)}%`))
        .catch(err => console.log(`error loading "${url}"`, JSON.stringify(err)));    
};

const loadAllResources = async (resources) => {
    const loader = new JSONLoader();
    
    const allResources = await Promise.all(
        resources.map(x => loadResourceAsync(loader, x.name, x.url)));
    console.log('loading done!');
    return allResources;
};

export default loadAllResources;