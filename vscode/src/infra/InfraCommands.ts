import * as vscode from 'vscode';
import { DebugAdapterDescriptorFactory, Disposable, StatusBarItem, TreeDataProvider, WebviewPanel } from 'vscode';

const registerTreeDataProvider = <T>(viewId: string, treeDataProvider: TreeDataProvider<T>): Disposable => {
    return vscode.window.registerTreeDataProvider(viewId, treeDataProvider);
}

const registerCommand = (command: string, callback: (...args: any[]) => any, thisArg?: any): Disposable => {
    return vscode.commands.registerCommand(command, callback, thisArg);
}
const executeCommand = <T = unknown>(command: string, ...rest: any[]): Thenable<T> => {
    return vscode.commands.executeCommand(command, ...rest);
}

const registerDebugAdapterDescriptorFactory = (debugType: string, factory: DebugAdapterDescriptorFactory): Disposable => {
    return vscode.debug.registerDebugAdapterDescriptorFactory(debugType, factory);
}

const createStatusBarItem = (priority?: number): StatusBarItem => {
    return vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, priority);
}

const createWebviewPanel = (viewType: string, title: string): WebviewPanel => {
    return vscode.window.createWebviewPanel(viewType, title, vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
    })
}

const showWarning = <T extends string>(message: string, ...items: T[]): Thenable<T | undefined> => {
    return vscode.window.showWarningMessage(message, ...items);
}


const showInformation = <T extends string>(message: string, ...items: T[]): Thenable<T | undefined> => {
    return vscode.window.showInformationMessage(message, ...items);
}

const showErrorMessage = <T extends string>(message: string, ...items: T[]): Thenable<T | undefined> => {
    return vscode.window.showErrorMessage(message, ...items);
}

const withProgress = <R>(title: string, task: (setMsg: (msg: string) => void | undefined) => Thenable<R>, cancel?: () => void) => {
    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: title,
        cancellable: cancel != undefined,
    }, async (progress, token) => {
        cancel && token.onCancellationRequested(cancel)
        try {
            return await task((msg:string)=>{
                progress.report({ message: msg});
            });
        } catch (e) {
            vscode.window.showErrorMessage(((e as any).message) || e);
        }
    });
}

export {
    registerCommand,
    registerTreeDataProvider,
    executeCommand,
    registerDebugAdapterDescriptorFactory,
    createStatusBarItem,
    createWebviewPanel,
    withProgress,
    showWarning,
    showInformation,
    showErrorMessage
}