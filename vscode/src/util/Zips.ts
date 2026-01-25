import AdmZip = require('adm-zip');

const packZip = (dir: string, filter?: ((filename: string) => boolean)): Buffer => {
    const file = new AdmZip();
    file.addLocalFolder(dir, undefined, filter);
    return file.toBuffer();
}

const packZipMap=(map:any)=>{
    const file = new AdmZip();
    for(let key in map){
        file.addFile(key, map[key]);
    }
    return file.toBuffer();
}


export {
    packZip,packZipMap
}
