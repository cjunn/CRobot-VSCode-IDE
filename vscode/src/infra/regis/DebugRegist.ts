
import * as vscode from 'vscode';
import { DebugActor } from '../DebugActor';
import { Device, DeviceProvider } from '../DeviceProvider';
import { executeCommand, registerCommand, registerDebugAdapterDescriptorFactory, registerTreeDataProvider, showInformation, withProgress } from '../InfraCommands';
import { DebugAdapter } from '../DebugAdapter';
import { delay } from '../../util/Times';
class DebugRegist {
    private context: vscode.ExtensionContext;
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    private connecting = false;


    public init({ debugActor, closeDevice, openDevice, listDevices, pushAttach, pushUI }: {
        debugActor: DebugActor,
        closeDevice: () => Promise<void>,
        openDevice: (address: string, ip: string, device: string, close: () => void) => Promise<string>,
        listDevices: () => Promise<Array<{ address: string, ip: string, device: string }>>,
        pushAttach: () => void,
        pushUI: () => void
    }) {

        let curDevice: Device | undefined = undefined;
        const deviceProvider = new DeviceProvider();
        const unLinkDevice = async () => {
            if (curDevice != undefined) {
                curDevice.setSelected(false);
                showInformation(`设备: ${curDevice.getAddress()} 已关闭`);
                curDevice = undefined;
            }
            await closeDevice();
        }

        //绑定Debugger调试器
        this.context.subscriptions.push(registerDebugAdapterDescriptorFactory("CRobotDebugger", new DebugAdapter(debugActor)));
        //绑定附件文件推送事件
        this.context.subscriptions.push(registerCommand('crobot.debug.att_debugger', () => pushAttach()));
        //绑定UI文件推送事件
        this.context.subscriptions.push(registerCommand('crobot.debug.ui_debugger', () => pushUI()));
        //绑定F5执行Debugger事件
        registerCommand('crobot.debug.code_debugger', () => executeCommand("workbench.action.debug.start"));
        //绑定Adb设备数据源
        this.context.subscriptions.push(registerTreeDataProvider("crobotDevice", deviceProvider));
        //绑定断开事件
        this.context.subscriptions.push(registerCommand('crobot.debug.disconnects', async () => unLinkDevice()));
        this.context.subscriptions.push(registerCommand('crobot.debug.disconnect', async () => unLinkDevice()));
        //绑定刷新事件
        this.context.subscriptions.push(registerCommand('crobot.debug.refresh', async () => {
            await withProgress("设备刷新中...!", async () => {
                if (!curDevice) {
                    curDevice = await deviceProvider.refrsh(curDevice, await listDevices());
                    await unLinkDevice();
                }
            });
        }));
        //绑定设备连接事件
        this.context.subscriptions.push(registerCommand('crobot.debug.connect', async (item) => {
            if (item == curDevice) {
                return;
            }
            if (this.connecting) {
                return;
            }
            this.connecting = true;
            unLinkDevice();
            let address: string = (<Device>item).getAddress();
            let device: string = (<Device>item).getDevice();
            let ip: string = (<Device>item).getIp();
            await withProgress("Adb设备连接中...!", async () => {
                try {
                    let deveName = await openDevice(address, ip, device, async () => {
                        await unLinkDevice();
                    });
                    showInformation(`成功连接上设备: ${deveName}`);
                    this.connecting = false;
                    item.setSelected(true);
                    curDevice = item;
                } catch (e) {
                    this.connecting = false;
                    await unLinkDevice();
                }
            }, async () => {
                this.connecting = false;
                await unLinkDevice();
            })
        }));
    }
}

export {
    DebugRegist
}