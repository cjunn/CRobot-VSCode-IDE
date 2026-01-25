import * as Net from 'net';
import * as vscode from 'vscode';
import { InitializedEvent, LoggingDebugSession, OutputEvent, Source, StoppedEvent, TerminatedEvent } from "vscode-debugadapter";
import { Subject } from 'await-notify';
import { DebugProtocol } from 'vscode-debugprotocol';
import { basename } from "path";
import { DebugActor } from './DebugActor';
import { showErrorMessage } from './InfraCommands';
interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    startFile: string;
}
class DebugSession extends LoggingDebugSession {
    private debugActor: DebugActor;
    private threadID: number = 1;
    private _configurationDone = new Subject();
    public constructor(debugActor: DebugActor) {
        super("CRobotDebugger.txt");
        // this debugger uses zero-based lines and columns
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);

        this.debugActor = debugActor;
        this.debugActor.onEntry(() => {
            this.sendEvent(new StoppedEvent('entry', this.threadID));
        });
        this.debugActor.onStep(() => {
            this.sendEvent(new StoppedEvent('step', this.threadID));
        });
        this.debugActor.onBreakpoint(() => {
            this.sendEvent(new StoppedEvent('breakpoint', this.threadID));
        });
        this.debugActor.onException((text: string) => {
            this.sendEvent(new StoppedEvent('exception', this.threadID, text));
        });
        this.debugActor.onOutput((text: any, filePath: any, line: any, column: any) => {
        
            const e: DebugProtocol.OutputEvent = new OutputEvent(`${text}\n`);
            if (text === 'start' || text === 'startCollapsed' || text === 'end') {
                e.body.group = text;
                e.body.output = `group-${text}\n`;
            }
            e.body.source = this.createSource(filePath);
            e.body.line = line;
            e.body.column = this.convertDebuggerColumnToClient(column);
            this.sendEvent(e);
        });

        this.debugActor.onEnd(() => {
            this.sendEvent(new TerminatedEvent());
        });
    }

    /**
    * The 'initialize' request is the first request called by the frontend
    * to interrogate the features the debug adapter provides.
    */
    protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
        // build and return the capabilities of this debug adapter:
        response.body = response.body || {};

        // the adapter implements the configurationDoneRequest.
        response.body.supportsConfigurationDoneRequest = true;

        // make VS Code to use 'evaluate' when hovering over source
        response.body.supportsEvaluateForHovers = true;

        // make VS Code to show a 'step back' button
        response.body.supportsStepBack = true;

        // make VS Code to support data breakpoints
        response.body.supportsDataBreakpoints = true;

        // make VS Code to support completion in REPL
        response.body.supportsCompletionsRequest = true;
        response.body.completionTriggerCharacters = [".", "["];

        // make VS Code to send cancelRequests
        response.body.supportsCancelRequest = true;

        response.body.supportsTerminateRequest = true;

        // make VS Code send the breakpointLocations request
        response.body.supportsBreakpointLocationsRequest = true;

        // make VS Code provide "Step in Target" functionality
        response.body.supportsStepInTargetsRequest = true;

        this.sendResponse(response);

        // since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
        // we request them early by sending an 'initializeRequest' to the frontend.
        // The frontend will end the configuration sequence by calling 'configurationDone' request.
        this.sendEvent(new InitializedEvent());
    }

    /**
     * Called at the end of the configuration sequence.
     * Indicates that all breakpoints etc. have been sent to the DA and that the 'launch' can start.
     */
    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void {
        super.configurationDoneRequest(response, args);
        // notify the launchRequest that configuration has finished
        this._configurationDone.notify();
    }

    protected async launchRequest(response: DebugProtocol.LaunchResponse, args: ILaunchRequestArguments) {
        await this._configurationDone.wait(1000);
        try{
            await this.debugActor.callLaunch();
            this.sendResponse(response);
        }catch(e:any){
            showErrorMessage(e);
            this.sendEvent(new TerminatedEvent(false));
        }
    }

    protected async terminateRequest(response: DebugProtocol.TerminateResponse, args: DebugProtocol.TerminateArguments) {
        try{
            await this.debugActor.callTerminate();
            this.sendResponse(response);
        }catch(e:any){
            showErrorMessage(e);
        }
    }


    private createSource(filePath: string): Source {
        return new Source(basename(filePath), this.convertDebuggerPathToClient(filePath), undefined, undefined, 'mock-adapter-data');
    }

}

class DebugAdapter implements vscode.DebugAdapterDescriptorFactory {
    private server?: Net.Server;
    private debugActor: DebugActor;
    constructor(debugActor: DebugActor) {
        this.debugActor = debugActor;
    }
    createDebugAdapterDescriptor(session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        if (!this.server) {
            this.server = Net.createServer(socket => {
                const session = new DebugSession(this.debugActor);
                session.setRunAsServer(true);
                session.start(socket as NodeJS.ReadableStream, socket);
            }).listen(0);
        }
        return new vscode.DebugAdapterServer((this.server.address() as Net.AddressInfo).port);
    }
    dispose() {
        if (this.server) {
            this.server.close();
        }
    }
}

export {
    DebugAdapter
}