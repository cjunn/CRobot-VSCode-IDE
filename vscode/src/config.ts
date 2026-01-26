
import { workspace } from "vscode";
import * as vscode from 'vscode';
import { sep as SEP } from 'path';
import path = require('path');
import * as fs from 'fs';

const exitsFile =(filePath:string)=>{
    return fs.existsSync(filePath);
}

const getConfigs = (context: vscode.ExtensionContext) => {
    const debugPanel = false;
    const workDir: string = vscode.workspace.workspaceFolders?.[0].uri.fsPath || "";
    const codeDir: string = `${workDir}${SEP}src`;
    const attachDir: string = `${workDir}${SEP}attach`;
    const dDbFile: string = `${workDir}${SEP}attach${SEP}d_points.db`;
    const uiDir: string = `${workDir}${SEP}ui`;
    const photoDir = `${workDir}${SEP}photo`;
    const buildDir: string = `${workDir}${SEP}build`;
    const versionFile: string = `${workDir}${SEP}version.json`;
    const workspaceName = <string>vscode.workspace.name;

    const config = workspace.getConfiguration("crobot");
    const adbPath: string = config["adbPath"];
    const apkPath: string = config["apkPath"];
    const scanPort:number = parseInt(config["scanPort"]);
    const rpcPort: number = parseInt(config["rpcPort"]);
    const filePort: number = parseInt(config["filePort"]);
    const apkActivity: string = "com.crobot.debug/.PermissionActivity";
    const compilerUrl: string = config["compilerUrl"];

    const _adbPath = path.join(context.extensionPath, 'kit/adb/adb.exe');
    const _compilerUrl = "127.0.0.1:8080";
    const _apkPath = path.join(context.extensionPath, 'kit/debug.apk');

    const module = "main";
    const func = "main";

    let language = "";
    if(exitsFile(`${codeDir}${SEP}${module}.js`)){
        language = "js";
    }else if(exitsFile(`${codeDir}${SEP}${module}.lua`)){
        language = "lua";
    }

    return {
        adbPath: adbPath ? adbPath : _adbPath,
        apkPath: apkPath ? apkPath : _apkPath,
        scanPort,
        rpcPort,
        filePort,
        apkActivity,
        codeDir,
        attachDir,
        uiDir,
        photoDir,
        buildDir,
        versionFile,
        workspaceName,
        compilerUrl: compilerUrl ? compilerUrl : _compilerUrl,
        module,
        func,
        language,
        debugPanel,
        dDbFile
    }
}



export {
    getConfigs
}
