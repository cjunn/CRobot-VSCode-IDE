import * as vscode from 'vscode';
import { createWebviewPanel } from './InfraCommands';
import { WebService } from './WebService';
const TYPE_REQUEST = 1;
const TYPE_RESPONSE = 2;
const STATUS_SUCCESS = 0;
const STATUS_ERROR = -1;

abstract class BasePanel {
    private invoker: { invoke: (methodName: string, data: any) => Promise<any> | any };
    private context: vscode.ExtensionContext;
    private panel: vscode.WebviewPanel | undefined;
    private server:WebService;
    constructor(context: vscode.ExtensionContext,server:WebService, invoker: { invoke: (methodName: string, data: any) => Promise<any> | any }) {
        this.invoker = invoker;
        this.context = context;
        this.server = server;
    }

    private sendErrorResponse(webview: vscode.Webview, uuid: string, msg: string) {
        if (this.panel) {
            webview.postMessage({
                type: TYPE_RESPONSE,
                uuid: uuid,
                msg: msg,
                status: STATUS_ERROR
            });
        }
    }

    private sendSucessResponse(webview: vscode.Webview, uuid: string, result: any) {
        if (this.panel) {
            webview.postMessage({
                type: TYPE_RESPONSE,
                uuid: uuid,
                data: result || {},
                status: STATUS_SUCCESS
            });
        }
    }

    private async invokeMapping(message: any, webview: vscode.Webview) {
        let { data, uuid, type, method } = message;
        if (type != TYPE_REQUEST) {
            return;
        }
        try{
            let result = await this.invoker.invoke(method, data);
            this.sendSucessResponse(webview, uuid, result);
        }catch(err){
            console.error(err);
            let message = (err as any).message||(err as any);
            this.sendErrorResponse(webview, uuid, message);
            return;
        }
    }

    public async createWebPanel(debugPanel:boolean) {
        let newPanel = createWebviewPanel(this.id(),this.name());
        newPanel.webview.html = await this.server.getWebViewContent(this.module(),debugPanel);
        newPanel.webview.onDidReceiveMessage(message => this.invokeMapping(message, newPanel.webview), undefined, this.context.subscriptions);
        newPanel.onDidDispose(() => newPanel == this.panel ? this.panel = undefined : null, undefined, this.context.subscriptions);
        this.panel = newPanel;
        return newPanel;
    }


    public abstract id():string;
    public abstract name():string;
    public abstract module():string;
}

export {
    BasePanel
}