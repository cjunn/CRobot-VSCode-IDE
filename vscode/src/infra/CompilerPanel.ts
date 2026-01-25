import { BasePanel } from './BasePanel';

class CompilerPanel extends BasePanel{
    public id(): string {
        return 'compilerWebview';
    }
    public name(): string {
        return "CRobot编译器";
    }
    public module(): string {
        return 'compiler';
    }
}

export {
    CompilerPanel
}