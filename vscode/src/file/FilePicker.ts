import * as fs from 'fs';
import path = require('path');
const crypto = require('crypto');

interface FileModify {
    path: string;
    md5: string;
    fullPath: string;
}

const listAllFile = (dir: string, root: string, fileList: string[]): string[] => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            listAllFile(fullPath, root, fileList);
        } else {
            fileList.push(fullPath.substring(root.length));
        }
    });
    return fileList;
}

const toFileModifys = (pickDir:string,list: string[]): FileModify[] => {
    let ret: FileModify[] = [];
    for (var item of list) {
        const fullPath = path.join(pickDir, item);
        const fileBuffer = fs.readFileSync(fullPath);
        const md5Hash = crypto.createHash('md5');
        md5Hash.update(fileBuffer);
        const fileMd5 = md5Hash.digest('hex');
        ret.push({
            path: item,
            md5: fileMd5,
            fullPath: fullPath
        });
    }
    return ret;
}

class FilePicker {
    private pickDir: string;
    
    constructor(pickDir: string) {
        this.pickDir = pickDir;
    }

    public getList(): FileModify[] {
        return toFileModifys(this.pickDir, listAllFile(this.pickDir, this.pickDir, []));
    }

    public getList2(list:string[]): FileModify[] {
        return toFileModifys(this.pickDir, list);
    }

}
export {
    FilePicker,FileModify
}