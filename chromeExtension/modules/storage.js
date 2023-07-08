export async function readLocalStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function(res) {
            resolve(res[key]);
        });
    });
}

export async function setLocalStorage(key, value) {
    await chrome.storage.local.set({[key]: value});
}

export async function removeFromStorage(key) {
    await chrome.storage.local.remove([key]);
}

export async function addToStorageList(key, value) {
    let list = await readLocalStorage(key);
    if (list === null) {
        list = [];
    }
    list.push(value);
    await setLocalStorage(key, value);
}

export async function removeFromStorageList(key, value) {
    let list = await readLocalStorage(key);
    if (list === undefined) {
        return;
    }
    await setLocalStorage(key, list.filter(item => item !== value));
}

export async function addToStorageDict(key, innerKey, value) {
    let dict = await readLocalStorage(key);
    if (dict === undefined) {
        dict = {};
    }
    dict[innerKey] = value;

    await setLocalStorage(key, dict);
}

export async function removeFromStorageDict(key, innerKey, value) {
    let dict = await readLocalStorage(key);
    if (dict === undefined) {
        return;
    }
    delete dict[innerKey];

    await setLocalStorage(key, dict);
}