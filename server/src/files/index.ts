import { is } from '@/shared/src/validation';
import { File as UFile } from 'formidable';
import fse, { mkdir } from 'fs-extra';
import extract from 'extract-zip';
import { ncp } from 'ncp';
import path from 'path';
import fs from 'fs';

const docsdir = '/server';
const uploaddir = '/server/uploads';

const parentDir = (p: string, n: number = 1): string => p.length > 1 ? (n == 0 ? p : parentDir(path.dirname(p), n - 1)) : '';
const fileName = (p: string): string => p ? path.basename(p) : '';

type Err = NodeJS.ErrnoException;
const Root = parentDir(__dirname, 3);

const createDir = (path: string) => new Promise<void>((resolve, reject) => mkdir(Root + path, { recursive: true }, err => err ? reject(err) : resolve()));

/**
 * uploads the given UFiles to the given root directory
 */
const upload = (root: string, ...paths: (UFile | File)[]) => {
    root = Root + root;
    let files = paths.filter((f: any) => f && is.object(f) && is.string(f.name) && is.string(f.path)).map(f => f as UFile);
    return new Promise<void>((resolve, reject) => {
        let c = files.length;
        if (c == 0) return resolve();
        files.forEach(file => fse.move(file.path, `${root}/${file.name}`, count(v => c = set(c, v), resolve, reject)));
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
    [from, to] = [from, to].map(path => Root + path.toLowerCase());
    return new Promise<void>((resolve, reject) => {
        if (from == to) return resolve();
        if (to.startsWith(from + (from.endsWith('/') ? '' : '/'))) return reject(`Error: Attempting to recursively move directories: ${from} -> ${to}`);
        mkdir(to, { recursive: true }, err => {
            if (err) return reject(err);
            ncp(from, to, { stopOnErr: true }, err => {
                if (err) return reject(err);
                remove(from.slice(Root.length)).then(() => resolve()).catch(() => reject(err));
            });
        });
    });
}

/**
 * removes given files and directories recursively, recursively removes empty parent directories after removing its content
 */
const remove = (...paths: string[]) => {
    paths = paths.filter(path => path).map(path => Root + path);
    return new Promise<void>((resolve, reject) => {
        let c = paths.length;
        if (c == 0) return resolve();
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
const chain = (...calls: (() => Promise<any> | any)[]) => {
    calls = calls.filter(call => call);
    return new Promise<void>((resolve, reject) => {
        let call = (i: number) => {
            if (i == calls.length) return resolve();
            Promise.resolve(calls[i]()).then(() => call(i + 1)).catch(err => reject(err));
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

/**
 * uploads the given items, moving, deleting and replacing directories where needed
 */
const uploadFiles = <E>(items: E[], base: string, newFile: (e: E) => boolean, getClear: (e: E) => string[], getTemp: (e: E) => string, getDir: (e: E) => string, getOld: (e: E) => string,
    getUpload: (e: E, dir: string) => Promise<any>, done: (e: E, dir: string, diff: boolean) => void = () => {}): Promise<void[]> => {
    let moves: Promise<void>[] = [];
    let initialUploads: Promise<void>[] = [];
    let secondaryUploads: (() => Promise<void>)[] = [];
    const lower = (string: string): string => string.toLowerCase();
    items.forEach(item => {
        let file = newFile(item);
        let [dir, old] = [lower(getDir(item)), lower(getOld(item))];
        let [bdir, bold] = [base + dir, base + (old || dir)];
        if (!file && bdir == bold) return done(item, dir, false);
        let moving = bdir != bold && items.some(x => lower(getDir(x)) == old);
        if (moving) {
            let temp = `${parentDir(bold)}/${lower(getTemp(item))}`;
            moves.push(move(bold, temp));
            bold = temp;
        }
        const clear = () => chain(() => remove(!old || bdir != bold ? bdir : ''), () => move(bold, bdir), file ? () => remove(...getClear(item).map(x => bdir + x)) : () => {});
        const upload = () => chain(clear, file ? () => getUpload(item, bdir) : () => {}, () => done(item, dir, true));
        moving || items.some(x => lower(getOld(x)) == dir) ? secondaryUploads.push(upload) : initialUploads.push(upload());
    });

    return Promise.all([...initialUploads, chain(() => Promise.all(moves), () => Promise.all(secondaryUploads.map(upload => upload())))]);
}

export { UFile, Root, docsdir, uploaddir, parentDir, fileName, createDir, upload, move, remove, unzip, chain, uploadFiles };
