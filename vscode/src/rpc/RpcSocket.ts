import * as net from "net"
import readline = require('readline');
import { delay } from "../util/Times";
interface SocketEvent {
    onConnected?: () => void;
    onClose?: (error?: Error) => void;
    onReceive?: (line: string) => void;
}



class RpcSocket {
    private events: SocketEvent[] = [];
    private socket: net.Socket | undefined;
    private closed = false;
    private status = false;
    private pIdx = 0;
    constructor() {
    }


    public bindEvent(event: SocketEvent) {
        this.events.push(event);
    }

    public async connect(ip: string, port: number, onClose: () => void) {
        return new Promise<void>((c, e) => {
            let socket = new net.Socket();
            socket.setTimeout(2000);
            readline.createInterface({ input: socket, output: socket, crlfDelay: Infinity })
                .on('line', (line) => this.events.forEach(event => event.onReceive?.(line)));
            let onceReceiveListen = () => {
                this.status = true;
                this.events.forEach(event => event.onConnected?.());
                socket?.removeListener('data', onceReceiveListen);
                socket?.removeListener('error', onceErrorListener);
                socket?.removeListener('close', onceErrorListener);
                socket.on("error", (error) => {
                    onClose();
                    this.status = false;
                    this.events.forEach(event => event.onClose?.(error));
                });
                socket.on("close", () => {
                    onClose();
                    this.status = false;
                    this.events.forEach(event => event.onClose?.());
                });
                c();
            }
            let onceErrorListener = () => {
                this.status = false;
                this.events.forEach(event => event.onClose?.());
                socket?.removeListener('data', onceReceiveListen);
                socket?.removeListener('error', onceErrorListener);
                socket?.removeListener('close', onceErrorListener);
                e();
            }

            socket.prependOnceListener('data', onceReceiveListen);
            socket.prependOnceListener('error', onceErrorListener);
            socket.prependOnceListener('close', onceErrorListener);
            socket?.connect(port, ip);
            this.socket = socket;
        });
    }

    public async start(ip: string, port: number, onClose: () => void) {
        this.close();
        this.closed = false;
        while (true) {
            try {
                return await this.connect(ip, port, onClose);
            } catch (e) {
                if (this.closed) {
                    throw e;
                }
                await delay(1000);
            }
        }
    }

    public write(line: string) {
        if (!this.status || this.socket == undefined) {
            //throw "命令发送失败,请检查是否连接设备!";
            return false;
        }
        this.socket.write(line);
        this.socket.write('\n');
        return true;
    }

    public close() {
        this.closed = true;
        this.socket?.end();
        this.socket?.destroy();
    }

    public isClose() {
        return !this.closed && this.status;
    }

}


export {
    SocketEvent,
    RpcSocket
}