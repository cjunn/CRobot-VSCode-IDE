import * as vscode from 'vscode';
class Device extends vscode.TreeItem {
    private static SELECTED_ICON: vscode.ThemeIcon = new vscode.ThemeIcon("circle-large-filled", new vscode.ThemeColor("inputValidation.errorBorder"));
    private static UNSELECT_ICON: vscode.ThemeIcon = new vscode.ThemeIcon("circle-large-filled", new vscode.ThemeColor("inputValidation.errorForeground"));
    private ip:string;
    private address: string;
    private device: string;
    private emit: vscode.EventEmitter<Device | undefined | null | void>;

    constructor(address: string,ip:string, device: string, emit: vscode.EventEmitter<Device | undefined | null | void>) {
        super('['+device+'] '+address, vscode.TreeItemCollapsibleState.None);
        this.address = address;
        this.device = device;
        this.ip = ip;
        this.iconPath = Device.UNSELECT_ICON;
        this.emit = emit;
        this.contextValue = "unselect";
    }

    getAddress(): string {
        return this.address;
    }
    getDevice(): string {
        return this.device;
    }

    getIp(): string {
        return this.ip;
    }

    setSelected(selected: boolean): void {
        if (selected) {
            this.iconPath = Device.SELECTED_ICON;
            this.contextValue = "selected";
        } else {
            this.iconPath = Device.UNSELECT_ICON;
            this.contextValue = "unselect";
        }
        this.emit.fire();
    }

    getSelected(): boolean {
        return this.contextValue == "selected";
    }

}

class DeviceProvider implements vscode.TreeDataProvider<Device> {
    private Devices: Device[] = [];
    private emit: vscode.EventEmitter<Device | undefined | null | void> = new vscode.EventEmitter<Device | undefined | null | void>();
    readonly onDidChangeTreeData?: vscode.Event<void | Device | Device[] | null | undefined> | undefined = this.emit.event;
    getTreeItem(element: Device): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: Device | undefined): vscode.ProviderResult<Device[]> {
        return Promise.resolve(Array.from(this.Devices));
    }
    async refrsh(current: Device | undefined, devices: Array<{ address: string,ip:string, device: string }>): Promise<Device | undefined> {
        this.Devices = [];
        this.emit.fire();
        this.Devices = devices?.map(k => new Device(k.address,k.ip, k.device, this.emit)) || [];
        this.emit.fire();
        for (let value of this.Devices) {
            if (current && current.getAddress() == value.getAddress()) {
                value.setSelected(true)
                return value;
            }
        }
    }
}

export { Device, DeviceProvider }