import { error } from "console";
import { RpcClient } from "./RpcClient";

class ClientHandle {
    private handleMap = new Map<string, {method: any, object: any}>();
    private client: RpcClient;

    constructor(client: RpcClient) {
        this.client = client;
    }

    public regisMapping(object: any) {
        Object.getOwnPropertyNames(object).forEach((methodName:any) => {
            if(typeof object[methodName] === 'function'){
                let method = object[methodName];
                this.handleMap.set(methodName, {method, object});
            }
        });
    }

    public invoke(methodName: string, uuid: string, data: any):any {
        if(!methodName){
            return;
        }
        let handle = this.handleMap.get(methodName);
        if(!handle){
            this.client.errorResponse(uuid,"CRobot-Client 未找到处理器[" + methodName + "]");
            return;
        }
        let func = handle.method;
        let object = handle.object;
        return func.apply(object,[data])
    }

}

export{ClientHandle}