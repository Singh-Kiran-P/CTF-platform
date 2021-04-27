import { File as UFile } from 'formidable';
import { is } from '@shared/validation';
import extract from 'extract-zip';
import fse from 'fs-extra';
import path from 'path';
import fs from 'fs';

const parentDir = (p: string, n: number = 1): string => p ? (n == 0 ? p : parentDir(path.dirname(p), n - 1)) : '';
const fileName = (p: string): string => p ? path.basename(p) : '';

type Err = NodeJS.ErrnoException;
const Root = parentDir(require.main.filename, 5);

/**
 * uploads the given UFiles to the given root directory
 */
const upload = (root: string, ...paths: (UFile | File)[]) => {
    root = Root + root;
    let files = paths.filter((f: any) => is.object(f) && is.string(f.name) && is.string(f.path)).map(f => f as UFile);
    return new Promise<void>((resolve, reject) => {
        if (!files) return resolve();
        fs.mkdir(root, { recursive: true }, err => {
            if (err) return reject(err);
            Promise.all(files.map(file => fse.move(file.path, `${root}/${file.name}`))).then(() => resolve()).catch(err => reject(err));
        });
    });
}

/**
 * recursively removes the parentdir of the given path until it finds a non emtpy parentdir, then calls cb
 */
const rmup = (path: string, cb: () => void): void => fs.rmdir(parentDir(path), err => err ? cb() : rmup(parentDir(path), cb));

/**
 * moves the given path, rejects on error
 */
const move = (from: string, to: string) => {
    [from, to] = [from, to].map(path => Root + path);
    return new Promise<void>((resolve, reject) => {
        if (from == to) return resolve();
        fse.move(from, to).then(() => rmup(from, () => resolve())).catch(err => reject(err));
    });
}

/**
 * removes given files and directories recursively, recursively removes empty parent directories after removing its content
 */
const remove = (...paths: string[]) => {
    paths = paths.filter(path => path).map(path => Root + path);
    return new Promise<void>((resolve, reject) => {
        if (!paths) return resolve();
        let c = paths.length;
        paths.forEach(path => fs.rm(path, { recursive: true }, count(v => c = set(c, v), resolve, reject, ['ENOENT'], cb => rmup(path, cb))));
    });
}

/**
 * unzips the given file to its directory
 */
const unzip = (zip: string) => {
    zip = Root + zip;
    return extract(zip, { dir: parentDir(zip) });
}

/**
 * calls each given call after the previous one resolved, resolves after all calls resolved or rejects upon any calls rejecting
 */
const chain = (...calls: (() => Promise<any>)[]) => {
    calls = calls.filter(call => call);
    return new Promise<void>((resolve, reject) => {
        let call = (i: number) => {
            if (i == calls.length) return resolve();
            calls[i]().then(() => call(i + 1)).catch(err => reject(err));
        }
        call(0);
    });
}

// these functions are used to easily await all fs callbacks before resolving a promise, or rejecting it upon error, ask Lander for proper usage
const set = (c: number, v?: number): number => v == undefined ? c : v;
const count = (c: (v?: number) => number, resolve: () => void, reject: (err: any) => void, allow: string[] = [], action: (cb: () => void) => void = cb => cb()): (err: Err) => void => {
    return (err: Err): void => {
        if (c() < 0) return;
        if (err && !allow.includes(err.code)) {
            c(-1);
            return reject(err);
        }
        action(() => {
            c(c() - 1);
            if (c() == 0) resolve();
        });
    }
}

export { UFile, parentDir, fileName, upload, move, remove, unzip, chain };
