class DebugActor {
    private terminate: (() => void | Promise<void>) | undefined;
    private launch: (() => void | Promise<void>) | undefined;
    private output: ((text: any, filePath: any, line: any, column: any) => void | Promise<void>) | undefined;
    private end: (() => void | Promise<void>) | undefined;

    private entry: (() => void | Promise<void>) | undefined;
    private step: (() => void | Promise<void>) | undefined;
    private breakpoint: (() => void | Promise<void>) | undefined;
    private exception: ((text: string) => void | Promise<void>) | undefined;

    public callTerminate() {
        return this.terminate?.();
    }
    public onTerminate(listen: () => void | Promise<void>) {
        this.terminate = listen;
    }

    public callLaunch() {
        return this.launch?.();
    }
    public onLaunch(listen: () => void | Promise<void>) {
        this.launch = listen;
    }

    public callOutput(text: any, filePath: any, line: any, column: any) {
        return this.output?.(text, filePath, line, column);
    }

    public onOutput(listen: (text: any, filePath: any, line: any, column: any) => void | Promise<void>) {
        this.output = listen;
    }

    public callEnd() {
        return this.end?.();
    }

    public onEnd(listen: () => void | Promise<void>) {
        this.end = listen;
    }


    public callEntry() {
        return this.entry?.();
    }
    public onEntry(listen: () => void | Promise<void>) {
        this.entry = listen;
    }

    public callStep() {
        return this.step?.();
    }

    public onStep(listen: () => void | Promise<void>) {
        this.step = listen;
    }


    public callBreakpoint() {
        return this.breakpoint?.();
    }

    public onBreakpoint(listen: () => void | Promise<void>) {
        this.breakpoint = listen;
    }

    public callException(text: string) {
        return this.exception?.(text);
    }

    public onException(listen: (text: string) => void | Promise<void>) {
        this.exception = listen;
    }
}

export { DebugActor };