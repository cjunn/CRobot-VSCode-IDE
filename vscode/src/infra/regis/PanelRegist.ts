
import * as vscode from 'vscode';
import { WebService } from '../WebService';
import { PickerPanel } from '../PickerPanel';
import { CompilerPanel } from '../CompilerPanel';
import { registerCommand } from '../InfraCommands';
class PanelRegist {
    private context: vscode.ExtensionContext;
    private debugPanel:boolean = false;
    constructor(context: vscode.ExtensionContext,debugPanel:boolean) {
        this.context = context;
        this.debugPanel = debugPanel;
    }

    public init(
        pickInvoker: { invoke: (methodName: string, data: any) => Promise<any> | any },
        comilerInvoker: { invoke: (methodName: string, data: any) => Promise<any> | any },
        proryMap: { [key: string]: string }) {
        const server = new WebService(this.context, proryMap);
        let pickerPanel = new PickerPanel(this.context, server, pickInvoker);
        //let compilerPanel = new CompilerPanel(this.context, server, comilerInvoker);
        this.context.subscriptions.push(registerCommand('crobot.debug.view', async () => await pickerPanel.createWebPanel(this.debugPanel)));
        //this.context.subscriptions.push(registerCommand('crobot.build.create', async () => { await compilerPanel.createWebPanel() }));
    }

}

export {
    PanelRegist
}