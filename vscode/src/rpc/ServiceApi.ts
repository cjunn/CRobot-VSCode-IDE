
import { RpcClient } from "./RpcClient";


function ApiBuild<T>(api: T, client: RpcClient) {
    return new Proxy(<any>api, {
        get(target: any, method: string, receiver: any) {
            const func = target[method];
            if (typeof func === 'function') {
                return function (...args: any[]) {
                    return client.request(method, args[0]);
                };
            }
            return receiver();
        }
    });
}

export {ApiBuild }



