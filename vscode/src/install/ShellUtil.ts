import * as cp from 'child_process';

interface Function<T> {
    stdout?(data: string): T | undefined;
    stderr?(data: string): T | undefined;
    close?(data: T): T;
}


const exec = <T>(cwd: string, binay: string, command: string | Array<string>, func: Function<T>): Promise<T> => {
    let comList: Array<string> = ['/c', binay];
    if (command instanceof Array) {
        for (let i = 0; i < command.length; i++) {
            let entry = command[i];
            comList.push(entry.trim());
        }
    } else {
        command.trim().split(' ').forEach(val => {
            comList.push(val.trim());
        });
    }

    return new Promise((resolve, reject) => {
        let executeRes: T;
        let spLine = cp.spawn('cmd.exe', comList, { cwd });
        spLine.stdout.on('data', (data) => {
            if (func.stdout != undefined) {
                let res = func.stdout(data.toString());
                if (res != null) {
                    executeRes = res;
                }
            }
            spLine.kill();
        });
        spLine.stderr.on('data', (data) => {
            if (func.stderr != undefined) {
                let res = func.stderr(data.toString());
                if (res != null) {
                    executeRes = res;
                }
            }
            spLine.kill();
        });
        spLine.on('exit', function (code) {
            if (func.close != undefined) {
                executeRes = func.close(executeRes);
            }
            resolve(executeRes);
        });
    });
}

export { exec }