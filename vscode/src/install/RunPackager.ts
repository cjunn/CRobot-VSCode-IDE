import { error } from "console";
import { isExitsDir, readFile, readFileText,createFold } from "../util/Files";
import { packZip } from "../util/Zips";

class RunPackager {
    private codeDir: string;
    private attachDir: string;
    private uiDir: string;
    constructor({ codeDir, attachDir, uiDir }: { codeDir: string, attachDir: string, uiDir: string }) {
        this.codeDir = codeDir;
        this.attachDir = attachDir;
        this.uiDir = uiDir;
    }

    private check(dir: string) {
        if (!isExitsDir(dir)) {
            createFold(dir);
        }
    }

    public toCodeZip(): Uint8Array {
        this.check(this.codeDir);
        return new Uint8Array(packZip(this.codeDir).buffer)
    }

    public toAttach(): Uint8Array {
        this.check(this.attachDir);
        return new Uint8Array(packZip(this.attachDir).buffer)
    }

    public toUiXml(): Uint8Array {
        this.check(this.uiDir);
        return new Uint8Array(readFile(this.uiDir + "/setting.xml"));
    }

    public getUIXml():string{
        return readFileText(this.uiDir + "/setting.xml")
    }



}

export { RunPackager }


