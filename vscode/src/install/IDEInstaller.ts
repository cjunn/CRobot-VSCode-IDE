import * as path from 'path';
import { isExitsFile } from "../util/Files";
import { exec } from './ShellUtil';
const STARTED_ACTIVITY_CMD = "Warning: Activity not started, its current task has been brought to the front";
class IDEInstaller {
    private adbPath: string;
    private apkPath: string;
    private rpcPort: number;
    private filePort: number;
    private apkActivity: string;
    constructor({ adbPath, apkPath, rpcPort, filePort, apkActivity }:
        { adbPath: string, apkPath: string, rpcPort: number, filePort: number, apkActivity: string }) {
        this.adbPath = adbPath;
        this.apkPath = apkPath;
        this.rpcPort = rpcPort;
        this.filePort = filePort;
        this.apkActivity = apkActivity;
    }

    private checkAdbExe() {
        if (!isExitsFile(this.adbPath)) {
            throw new Error(`${this.adbPath} adbPath执行文件未找到!`);
        }
    }

    public async listAdbDevices(): Promise<{ address: string; device: string;ip:string }[]> {
        this.checkAdbExe();
        return await exec(
            path.dirname(this.adbPath), path.basename(this.adbPath), "devices",
            {
                stdout: (data) => {
                    return Array.from(data.toString().trim().split('\r\n'))
                        .splice(1)
                        .map(val => (<string>val).trim())
                        .filter(val => val)
                        .map(val => {
                            let deveLine = val.split("\t");
                            return { address: deveLine[0], device: 'adb', ip: '127.0.0.1' }
                        })
                }
            });
    }

    private async getPackage(address: string): Promise<string[]> {
        this.checkAdbExe();
        return await exec(
            path.dirname(this.adbPath), path.basename(this.adbPath), `-s ${address} shell pm list packages`,
            {
                stdout: (data) => {
                    return Array.from(data.toString().trim().split('\r\n'))
                        .map(val => (<string>val).trim())
                        .filter(val => val)
                }
            })
    }

    private async installApk(address: string): Promise<boolean> {
        this.checkAdbExe();
        if (!isExitsFile(this.apkPath)) {
            throw new Error(`${this.apkPath} apk文件未找到!`);
        }
        return await exec(
            path.dirname(this.adbPath), path.basename(this.adbPath), `-s ${address} install ${this.apkPath}`,
            {
                stdout: (data) => {
                    return data.toString().trim().indexOf("Success") > -1
                }
            })
    }

    private async startActivity(address: string, acitvity: string): Promise<boolean> {
        this.checkAdbExe();
        return await exec(
            path.dirname(this.adbPath), path.basename(this.adbPath), `-s ${address} shell am start -n ${acitvity} --es mode "debug"`,
            {
                stdout: (data) => {
                    let resList = Array.from(data.toString().trim().split('\r\n')).splice(1);
                    return (resList.length == 0 || (((<string>resList[0]).trim()) == STARTED_ACTIVITY_CMD));
                }
            })
    }

    private async isExitsActivity(address: string, acitvity: string): Promise<boolean> {
        this.checkAdbExe();
        return await exec(
            path.dirname(this.adbPath), path.basename(this.adbPath), ['-s', address, 'shell', `dumpsys activity activities | grep ${acitvity}`],
            {
                stdout: () => {
                    return true;
                }
            })
    }


    private async setLocalPort(address: string, localPort: number, remotePort: number): Promise<boolean> {
        this.checkAdbExe();
        return await exec(
            path.dirname(this.adbPath), path.basename(this.adbPath), `-s ${address} forward tcp:${localPort} tcp:${remotePort}`,
            {
                close: () => {
                    return true;
                }
            })
    }



    private async hasInstallApk(address: string, packName: string) {
        packName = packName.split("/")[0];
        let packageList = await this.getPackage(address);
        if (!packageList) {
            return false;
        }
        return packageList.filter(line => line.endsWith(packName)).length > 0;
    }


    public async install(address: string, localRpcPort: number, localFilePort: number): Promise<boolean> {
        if (!await this.hasInstallApk(address, this.apkActivity)) {
            let success = await this.installApk(address);
            if (!success) {
                return Promise.reject('apk安装失败!');
            }
        }
        if (!await this.setLocalPort(address, localRpcPort, this.rpcPort)) {
            return Promise.reject('adb端口1映射失败!');
        }
        if (!await this.setLocalPort(address, localFilePort, this.filePort)) {
            return Promise.reject('adb端口2映射失败!');
        }
        let hasStartApk = await this.isExitsActivity(address, this.apkActivity);
        if (!hasStartApk) {
            let success = await this.startActivity(address, this.apkActivity);
            if (!success) {
                return Promise.reject('启动CRobot应用失败!');
            }
        }
        return true;
    }

}

export {
    IDEInstaller
}