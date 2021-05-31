// use serialize before sending an object containing files with axios
// use deserialize when receiving a serialized object with express
// doing this makes it so that the files contained within the original object are uploaded and present in the deserialized object

import { Fields, Files as UFiles } from './formidableTypes';
type Obj = { [key: string]: any };
const fields = 'fields';

const objToArr = (obj: Obj): Array<any> => {
    let arr = [];
    for (const key in obj) arr.push(obj[key]);
    return arr;
}

const serialize = (obj: Obj): FormData => {
    let formData = new FormData();
    const findFiles = (obj: Obj, path: string): Obj => {
        let arr = Array.isArray(obj);
        for (const key in obj) {
            let location = path ? `${path}.${key}` : key;
            let val = obj[key];
            if (typeof val == 'object') {
                let newVal = null;
                if (val instanceof File) formData.append(location, val);
                else newVal = findFiles(val, location);
                obj = Object.assign({}, obj, { [key]: newVal });
            }
        }
        return arr ? objToArr(obj) : obj;
    }
    obj = findFiles(obj, '');
    formData.append(fields, JSON.stringify(obj));
    return formData;
}

const deserialize = (req: { fields?: Fields, files?: UFiles }): Obj => {
    if (!req.fields || typeof req.fields[fields] != 'string') return {};
    let obj = JSON.parse(req.fields[fields] as string) as Obj;
    const setFile = (obj: Obj, path: string, file: Object) => {
        let i = path.indexOf('.');
        if (i < 0) obj[path] = file;
        else setFile(obj[path.slice(0, i)], path.slice(i + 1), file);
    }
    for (const key in req.files) setFile(obj, key, req.files[key]);
    return obj;
}

export { serialize, deserialize };
