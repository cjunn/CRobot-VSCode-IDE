import * as fs from 'fs';
import { sep } from 'path';
import path = require('path');
let needle = require('needle');
const readFileText = (path: string) => {
    return fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
}

const mkdirFold = (filePath: string) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

const createFold = (foldPath: string) => {
    if (!fs.existsSync(foldPath)) {
        fs.mkdirSync(foldPath, { recursive: true });
    }
}




const saveFile = (filePath: string, data: string | NodeJS.ArrayBufferView) => {
    mkdirFold(filePath);
    fs.writeFileSync(filePath, data);
}

const isExitsFile = (path: string): boolean => {
    if (!path) {
        return false;
    }
    let isExits = false;
    try {
        let stat = fs.lstatSync(path);
        isExits = stat.isFile();
    } catch (err) {
        isExits = false;
    }
    if (!isExits) {
        return false;
    }
    return true;
}

const getFilePath = (dir: string, file: string): string => {
    return dir + sep + file;
}

const isExitsDir = (dir: string): boolean => {
    let isDir = false;
    try {
        let stat = fs.lstatSync(dir);
        isDir = stat.isDirectory();
    } catch (err) {
        isDir = false;
    }
    if (!isDir) {
        return false;
    }
    return true;
}

const writeFile = (filePath: string, content: string) => {
    mkdirFold(filePath);
    fs.writeFileSync(filePath, content);
}

const appendFile = (path: string, content: string) => {
    fs.appendFileSync(path, (content + "\r\n"), 'utf8');
}

const removeFile = (path: string) => {
    fs.unlink(path, () => { });
}

const readFile = (path: string): Buffer => {
    return fs.readFileSync(path);
}

const download = async (url: string, filePath: string) => {
    return new Promise<void>((resolve, reject) => {
        needle.get(url,
            (err: any, resp: any, body: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                saveFile(filePath, resp.raw);
                resolve();
            });
    });
}

function extractFileNameAndExt(fullFileName: string): { name: string; ext: string; } {
    if (typeof fullFileName !== 'string' || fullFileName.trim() === '') {
        return { name: '', ext: '' };
    }
    const trimmedName = fullFileName.trim();
    if (trimmedName.indexOf('.') === 0) {
        return { name: trimmedName, ext: '' };
    }
    const lastDotIndex = trimmedName.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === trimmedName.length - 1) {
        return { name: trimmedName, ext: '' };
    }
    const name = trimmedName.slice(0, lastDotIndex);
    const ext = trimmedName.slice(lastDotIndex);
    return { name, ext };
}

const listFileName = (dir: string): { name: string, ext: string }[] => {
    const absoluteDir = path.resolve(dir);
    const dirEntries = fs.readdirSync(absoluteDir, { withFileTypes: true });
    return dirEntries
        .filter(entry => entry.isFile())
        .map(entry => {
            return extractFileNameAndExt(entry.name);
        });
}

export {
    readFileText,
    readFile,
    isExitsFile,
    getFilePath,
    saveFile,
    isExitsDir,
    writeFile,
    appendFile,
    removeFile,
    download,
    createFold,
    listFileName
}