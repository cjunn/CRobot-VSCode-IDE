import { ApiBuild } from "./ServiceApi";
import { ClientHandle } from "./ClientMapping";
import { Request, Response, toJson, toMessage, buildErrorResponse, TYPE_REQUEST, TYPE_RESPONSE, STATUS_SUCCESS } from "./Message";
import { SocketEvent, RpcSocket } from "./RpcSocket";


class RpcClient {
    private socket: RpcSocket = new RpcSocket();
    private clientHandle: ClientHandle = new ClientHandle(this);
    private requestMap = new Map<string, { resolve: (value: any) => void; reject: (reason?: any) => void; }>();

    constructor() {
        this.socket.bindEvent({
            onReceive: (line: string) => this.onReceive(line)
        })
    }

    public bindEvent(event: SocketEvent) {
        this.socket.bindEvent(event);
    }


    public async start(ip: string, port: number, onClose: () => void) {
        await this.socket.start(ip, port, onClose);
    }

    public close() {
        this.socket.close();
    }

    private sendMessage(message: Request | Response): boolean {
        return this.socket.write(toJson(message));
    }

    errorResponse(uuid: string, msg: string) {
        this.sendMessage(buildErrorResponse(uuid, msg));
    }

    public request(method: string, data: any): Promise<any> {
        if (!this.socket.isClose()) {
            throw "命令发送失败,请检查是否连接设备!";
        }
        let uuid = Date.now() + '' + Math.round(Math.random() * 100000);
        let message: Request = {
            type: TYPE_REQUEST,
            method: method,
            uuid: uuid,
            data: data
        }
        return new Promise((resolve, reject) => {
            this.requestMap.set(uuid, { resolve, reject });
            if (!this.sendMessage(message)) {
                this.requestMap.delete(uuid);
                reject("命令发送失败,请检查是否连接设备!");
            }
        });
    }


    //处理接收到的数据包
    private onReceive(line: string) {
        let message = toMessage(line);
        if (message.type == TYPE_REQUEST) {
            message = <Request>message;
            let messageName = <string>message.method;
            this.invokeMethod(messageName, message.uuid, message.data)
            return
        }
        if (message.type == TYPE_RESPONSE) {
            message = <Response>message;
            let request = this.requestMap.get(message.uuid);
            if (!request) {
                return
            }
            let { resolve, reject } = request;
            this.requestMap.delete(message.uuid);
            if (message.status == STATUS_SUCCESS) {
                resolve(message.data);
            } else {
                reject(message.msg);
            }
            return
        }
    }


    public getServiceApi<T>(api: T): T {
        return ApiBuild(api, this);
    }

    public regisMapping(handle: any) {
        this.clientHandle.regisMapping(handle);
    }

    private invokeMethod(methodName: string, uuid: string, data: any) {
        this.clientHandle.invoke(methodName, uuid, data);
    }


}

export { RpcClient };