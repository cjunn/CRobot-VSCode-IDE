import * as fs from 'fs';
import path = require('path');
import * as net from "net"

const callSocket = (ip: string, port: number, callback: (socket: net.Socket) => void) => {
    return new Promise((resolve, reject) => {
        let socket = new net.Socket();
        socket.setTimeout(5000); // 5秒超时
        socket.on('error', () => {
            socket.destroy();
            resolve({});
        });
        socket.on('close', () => {
            socket.destroy();
            resolve({});
        });
        socket.on('connect', () => {
            callback(socket);
        });
        socket.on('data', () => {
        });
        socket.on('end', () => {
            resolve({});
        });
        socket.connect(port, ip);
    });
}

const writeString = (socket: net.Socket, str: string) => {
    const utf8Buffer = Buffer.from(str, 'utf8');
    const sizeBuffer = Buffer.alloc(4);
    sizeBuffer.writeUInt32BE(utf8Buffer.length, 0);
    socket.write(sizeBuffer);
    socket.write(utf8Buffer);
}

const writeInt = (socket: net.Socket, num: number) => {
    const sizeBuffer = Buffer.alloc(4);
    sizeBuffer.writeUInt32BE(num, 0);
    socket.write(sizeBuffer);
}



class FileSender {
    private port: number | undefined;
    private ip: string | undefined;
    private pickDir: string;

    constructor(pickDir: string) {
        this.pickDir = pickDir;
    }


    public bind(ip: string, port: number) {
        this.port = port;
        this.ip = ip;
    }

    public async push(list: string[], callback: (item: string) => void) {
        if (!this.port) {
            return;
        }
        for (var item of list) {
            const fullPath = path.join(this.pickDir, item);
            callback(item);
            await callSocket(this.ip as string, this.port as number, async socket => {
                writeString(socket, item);
                writeInt(socket, fs.statSync(fullPath).size);
                const fileStream = fs.createReadStream(fullPath, {
                    highWaterMark: 1024 * 1024
                });
                fileStream.on('data', (chunk) => {
                    socket.write(chunk);
                });
                fileStream.on('end', () => {
                    fileStream.close();
                });
            });
        }
    }

}

export {
    FileSender
}