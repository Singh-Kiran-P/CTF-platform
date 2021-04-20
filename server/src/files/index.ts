import { File as UFile } from 'formidable';
import path from 'path';
import fs from 'fs';

const parentDir = (n: number, dir: string): string => n == 0 ? dir : parentDir(n - 1, path.resolve(dir, '..'));

type Err = NodeJS.ErrnoException;
const Root = parentDir(4, path.dirname(require.main.filename));

const upload = (dest: string, ...files: UFile[]) => {
    dest = Root + dest;
    return new Promise<void>((resolve, reject) => {
        if (!files) return resolve();
        fs.mkdir(dest, { recursive: true }, err => {
            if (err) return reject(err);
            let c = files.length;
            files.forEach(file => fs.rename(file.path, `${dest}/${file.name}`, cb(v => c = set(c, v), resolve, reject)));
        })
    });
}

const set = (c: number, v?: number): number => v == undefined ? c : v;
const cb = (count: (v?: number) => number, resolve: () => void, reject: (err: any) => void, action?: () => void): (err: Err) => void => {
    return (err: Err): void => {
        if (count() < 0) return;
        if (err) {
            count(-1);
            return reject(err);
        }
        if (action) action();
        count(count() - 1);
        if (count() == 0) resolve();
    }
}

export { UFile, upload };
