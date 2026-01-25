


class PanelHandle {

    private handleMap = new Map<string, { method: any, object: any }>();
    constructor() {
    }

    public regisMapping(object: any) {
        Object.getOwnPropertyNames(object).forEach((methodName: any) => {
            if (typeof object[methodName] === 'function') {
                let method = object[methodName];
                this.handleMap.set(methodName, { method, object });
            }
        });

    }

    public invoke(methodName: string, data: any): Promise<any> {
        if (!methodName) {
            return Promise.resolve('');
        }
        let handle = this.handleMap.get(methodName);
        if (!handle) {
            throw "CRobot-Panel 未找到处理器[" + methodName + "]";
        }
        let func = handle.method;
        let object = handle.object;
        return func.apply(object, [data])
    }
}

export {
    PanelHandle
}