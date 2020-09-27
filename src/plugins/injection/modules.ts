import { logger } from '../../logger/logger.js';
import { ImportSyntax } from '../../resolution/transform.js';

let requestUrl: string, init: { [key: string]: any };

let __moduleDir__: string;

function __GetModuleDir() {
    return __moduleDir__;
}

function fetchText() {
    let importName: string;
    const importURL: string = __GetModuleDir() + requestUrl;
    const promiseName: Promise<string> = new Promise<string>((resolve, reject) => {
        fetch(__GetModuleDir() + requestUrl, init)
            .then(response => response.text())
            .then(value => importName = value)
            .then(value => resolve(value))
            .catch(reason => reject(reason));
    });
}


function fetchJSON() {
    let importName: { [key: string]: any };
    const importURL: string = __GetModuleDir() + requestUrl;
    const promiseName: Promise<{ [key: string]: any }> = new Promise<{ [key: string]: any }>((resolve, reject) => {
        fetch(__GetModuleDir() + requestUrl, init)
            .then(response => response.json())
            .then(value => importName = value)
            .then(value => resolve(value))
            .catch(reason => reject(reason));
    });
}

function fetchFormData() {
    let importName: FormData;
    const importURL: string = __GetModuleDir() + requestUrl;
    const promiseName: Promise<FormData> = new Promise<FormData>((resolve, reject) => {
        fetch(__GetModuleDir() + requestUrl, init)
            .then(response => response.formData())
            .then(value => importName = value)
            .then(value => resolve(value))
            .catch(reason => reject(reason));
    });
}

function fetchBlobW() {
    let importName: Blob;
    const importURL: string = __GetModuleDir() + requestUrl;
    const promiseName: Promise<Blob> = new Promise<Blob>((resolve, reject) => {
        fetch(__GetModuleDir() + requestUrl, init)
            .then(response => response.blob())
            .then(value => importName = value)
            .then(value => resolve(value))
            .catch(reason => reject(reason));
    });
}

function fetchArrayBuffer() {
    let importName: ArrayBuffer;
    const importURL: string = __GetModuleDir() + requestUrl;
    const promiseName: Promise<ArrayBuffer> = new Promise<ArrayBuffer>((resolve, reject) => {
        fetch(__GetModuleDir() + requestUrl, init)
            .then(response => response.arrayBuffer())
            .then(value => importName = value)
            .then(value => resolve(value))
            .catch(reason => reject(reason));
    });
}

function fetchUint8Array() {
    let importName: Uint8Array;
    const importURL: string = __GetModuleDir() + requestUrl;
    const promiseName: Promise<Uint8Array> = new Promise<Uint8Array>((resolve, reject) => {
        fetch(__GetModuleDir() + requestUrl, init)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => new Uint8Array(arrayBuffer))
            .then(value => importName = value)
            .then(value => resolve(value))
            .catch(reason => reject(reason));
    });
}


function fetchDataBase64() {
    let importName: string;
    const importURL: string = __GetModuleDir() + requestUrl;
    const promiseName: Promise<string> = new Promise<string>((resolve, reject) => {
        let type: string;
        fetch(__GetModuleDir() + requestUrl, init)
            .then(response => { type = response.type; return response.text(); })
            .then(text => `data:${type};base64,${btoa(text)}`)
            .then(base64 => importName = base64)
            .then(value => resolve(value))
            .catch(reason => reject(reason));
    });
}

function fetchObjectURL() {
    let importName: string;
    const importURL: string = __GetModuleDir() + requestUrl;
    const promiseName: Promise<string> = new Promise<string>((resolve, reject) => {
        fetch(__GetModuleDir() + requestUrl, init)
            .then(response => response.blob())
            .then(blob => URL.createObjectURL(blob))
            .then(value => importName = value)
            .then(value => resolve(value))
            .catch(reason => reject(reason));
    });
}

function fetchFile() {
    let importName: File;
    const importURL: string = __GetModuleDir() + requestUrl;
    const promiseName: Promise<File> = new Promise<File>((resolve, reject) => {
        let url = __GetModuleDir() + requestUrl;
        let fileName = url.substring(url.lastIndexOf('/') + 1);
        fetch(url, init)
            .then(response => response.blob())
            .then(blob => new File([blob], fileName))
            .then(value => importName = value)
            .then(value => resolve(value))
            .catch(reason => reject(reason));
    });
}


function removeCode() {

}

export type FetchType =
    'text' |
    'json' |
    'blob' |
    'arrayBuffer' |
    'formData';

export type MarkType =
    'file' |
    'uint8' |
    'objectURL' |
    'dataBase64';

export function getFetchTypeFunction(fetchType?: FetchType | MarkType): Function {
    switch (fetchType) {
        case 'text': return fetchText;
        case 'json': return fetchJSON;
        case 'blob': return fetchBlobW;
        case 'formData': return fetchFormData;
        case 'arrayBuffer': return fetchArrayBuffer;
        case 'objectURL': return fetchObjectURL;
        case 'file': return fetchFile;
        case 'dataBase64': return fetchDataBase64;
        case 'uint8': return fetchUint8Array;
        default: {
            throw new Error(`${fetchType} is not supported`);
            // return removeCode;
        };
    }
}

export function generateFetch(fetchType: FetchType | MarkType, url: string, importName: string = '', importURL: string = '', promiseName: string = '', init?: RequestInit) {
    let injectCode = getFetchTypeFunction(fetchType).toString();
    if (importName) {
        injectCode = injectCode.replace(/importName/gm, importName);
    } else {
        injectCode = injectCode.replace('let importName;', '');
        injectCode = injectCode.replace('.then(value => importName = value)', '');
    }

    if (importURL) {
        injectCode = injectCode.replace(/importURL/gm, importURL);
    } else {
        injectCode = injectCode.replace('const importURL = __GetModuleDir() + requestUrl;', '');
    }
    if (promiseName) {
        injectCode = injectCode.replace(/promiseName/gm, promiseName);
    } else {
        injectCode = injectCode.replace('const promiseName = ', '');
    }

    injectCode = injectCode.replace(/requestUrl/gm, JSON.stringify(url));
    injectCode = injectCode.replace(/bodyType/gm, JSON.stringify(fetchType));
    if (init) {
        injectCode = injectCode.replace(/init/gm, JSON.stringify(init));
    } else {
        injectCode = injectCode.replace(/, init/gm, '');
    }
    // let intent = 0;
    injectCode = injectCode.split('\n')
        .filter((value, index, arr) => index > 0 && index < arr.length - 1)
        .map(value => value.trim())
        .filter(value => value)
        .join('');
    return injectCode;
}


export function getFetchFor(importSyntax: ImportSyntax, defaultFetchType: FetchType, init?: RequestInit) {

    let url: string, importName: string = '', importURL: string = '', promiseName: string = '';
    let fetchType: FetchType | MarkType;
    let mark = importSyntax.modulePath.indexOf('!');
    if (mark > 0) {
        // any of MarkType
        fetchType = importSyntax.modulePath.substring(0, mark) as MarkType;
        url = importSyntax.modulePath.substring(mark + 1);
    } else {
        fetchType = defaultFetchType;
        url = importSyntax.modulePath;
    }

    let bindingNames = importSyntax.getAllExportNames();
    promiseName = bindingNames.find(bind => bind.isPromise())?.getName() || '';
    importURL = bindingNames.find(bind => bind.isURL())?.getName() || '';
    importName = bindingNames.find(bind => bind.isModuleName())?.getName() || '';

    return generateFetch(fetchType, url, importName, importURL, promiseName, init);
}
