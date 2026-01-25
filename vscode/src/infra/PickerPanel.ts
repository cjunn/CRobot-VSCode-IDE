import { BasePanel } from './BasePanel';

class PickerPanel extends BasePanel{
    public id(): string {
        return 'testWebview';
    }
    public name(): string {
        return "CRobot采点器";
    }
    public module(): string {
        return 'picker';
    }
}

export {
    PickerPanel
}