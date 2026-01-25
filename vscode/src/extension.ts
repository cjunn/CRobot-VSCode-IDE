import * as vscode from 'vscode';
import { getConfigs } from './config';
import { RpcClient } from './rpc/RpcClient';
import { getNotUsedPort } from './util/Nets';
import { IDEInstaller } from './install/IDEInstaller';
import { RunPackager } from './install/RunPackager';
import { DebugActor } from './infra/DebugActor';
import { PanelHandle } from './infra/PanelMapping';
import { uInt8ToBase64 } from './util/Base64s';
import { createStatusBarItem, showErrorMessage, withProgress } from './infra/InfraCommands';
import { packZipMap } from './util/Zips';
import { download, getFilePath, listFileName, readFileText, writeFile } from './util/Files';
import { PanelRegist } from './infra/regis/PanelRegist';
import { DebugRegist } from './infra/regis/DebugRegist';
import { FileModify, FilePicker } from './file/FilePicker';
import { FileSender } from './file/FileSender';
import { ScanClient } from './scan/ScanClient';
import { PointManager } from './picker/PointManager';
import { Point } from './picker/Point';
import { JsPointParse, LuaPointParse } from './picker/PointParse';
process.on('unhandledRejection', (reason: any) => {
	if (reason.startsWith && !reason.startsWith('fatal')) {
		showErrorMessage(reason);
	}
});

export async function activate(context: vscode.ExtensionContext) {
	const config = getConfigs(context);
	if (!config.language) {
		showErrorMessage("未知语言,请先初始化目录后重启!");
		return;
	}
	const statusBar = createStatusBarItem(200);
	const runPackager = new RunPackager(config)
	const ideInstaller = new IDEInstaller(config);
	const scanClient = new ScanClient(config.scanPort);
	const rpcClient = new RpcClient();
	const filePicker = new FilePicker(config.attachDir);
	const fileSender = new FileSender(config.attachDir);
	const debugActor = new DebugActor();
	const pickPanelHandle = new PanelHandle();
	const compilerPanelHandle = new PanelHandle();
	const pointManager = new PointManager(config);
	const pointParse = config.language == 'lua' ? new LuaPointParse() : new JsPointParse();
	context.subscriptions.push({
		dispose: () => pointManager.close()
	});
	await pointManager.init();
	const serviceApi = rpcClient.getServiceApi({
		launch: async ({ name, zip }: { name: string, zip: string, uiXml: string }) => { },
		terminate: async () => { },
		screenShot: async () => { },
		runScript: async ({ script, module }: { script: string, module: string }) => { },
		updateUI: async ({ name, xml }: { name: string, xml: string }) => { },
		updateFileList: async ({ list }: { list: FileModify[] }): Promise<any> => { },
	});
	const updateAttachFile = async () => {
		await withProgress("正在更新附件", async (setMsg) => {
			let list = filePicker.getList();
			let ret = await serviceApi.updateFileList({ list });
			if (!ret || ret.length == 0) {
				return;
			}
			await fileSender.push(ret, (item) => setMsg(item));
		});
	}


	rpcClient.regisMapping({
		output: ({ tag, source, line, message }: { tag: string, source: string, line: number, message: string }) => {
			if ("ERROR" == tag) {
				message = "\x1B[31m" + message;
			}
			source = getFilePath(config.codeDir, source.replace(/\\/g, '/'));
			debugActor.callOutput(message, source, line, 1);
		},
		end: () => {
			debugActor.callEnd();
		}
	});

	compilerPanelHandle.regisMapping({
		loadBuildFile: () => {
			let code = runPackager.toCodeZip();
			let ui = runPackager.toUiXml();
			let attachment = runPackager.toAttach();
			let buffer = packZipMap({ ui, code, attachment });
			return new Uint8Array(buffer);
		},
		loadBuildConfig: () => {
			let text = readFileText(config.versionFile);
			return JSON.parse(text);
		},
		writeBuildConfig: (arg: any) => {
			writeFile(config.versionFile, JSON.stringify(arg));
		},
		download: async (arg: any) => {
			let tarFile = getFilePath(config.buildDir, arg.fileName);
			await download(arg.url, tarFile);
		}
	})

	pickPanelHandle.regisMapping({
		screenShot: () => {
			return serviceApi.screenShot();
		},
		testPick: async (point: Point) => {
			let script = pointParse.toScript(point);
			return (await serviceApi.runScript({ script, module: "_testPick_" }));
		},
		testPoint: async ({ id }: { id: number }) => {
			let point = await pointManager.getPoint(id);
			let script = pointParse.toScript(point);
			return await serviceApi.runScript({ script, module: "_testDots_" });
		},
		testPointList: async (list: { id: number }[]) => {
			let points = await Promise.all(list.map(({id}:{id:number}) => pointManager.getPoint(id)));
			let script = pointParse.toScript(points as Point[]);
			return await serviceApi.runScript({ script, module: "_testDots_" });
		},
		addPoint: async (p: Point) => {
			return await pointManager.addPoint(p);
		},
		getPoint: async (id: number) => {
			return await pointManager.getPoint(id);
		},
		getPhoto: async (id: number) => {
			return await pointManager.queryPhoto(id);
		},
		delPoint: async (id: number) => {
			return await pointManager.delPoint(id);
		},
		queryPointList: async (p: any) => {
			return pointManager.queryPointList(p);
		},
	});

	rpcClient.bindEvent({
		onConnected: async () => {
			let name = config.workspaceName;
			let uiXml = runPackager.getUIXml();
			await serviceApi.updateUI({ name, xml: uiXml });
			statusBar.text = "CRobot设备已连接";
			statusBar.show();
		},
		onClose: (e) => {
			statusBar.text = "CRobot设备已断开";
			statusBar.show();
		}
	});

	debugActor.onLaunch(async () => {
		try {
			let name = config.workspaceName;
			let zip = runPackager.toCodeZip();
			let uiXml = runPackager.getUIXml();
			//let attach = runPackager.toAttach()
			await serviceApi.launch({ name, zip: uInt8ToBase64(zip), uiXml });
		} catch (e) {
			showErrorMessage(e as any);
			debugActor.callEnd();
			throw e;
		}
	});

	debugActor.onTerminate(() => {
		serviceApi.terminate();
	});

	//================>>开始注册到vscode中
	new PanelRegist(context, config.debugPanel).init(
		pickPanelHandle,
		compilerPanelHandle,
		{ '/api/compiler/': config.compilerUrl }
	);
	let openAdbDevice = async (address: string, ip: string, close: () => void) => {
		let localRpcPort = await getNotUsedPort();
		let localFilePort = await getNotUsedPort();
		await ideInstaller.install(address, localRpcPort, localFilePort);
		await rpcClient.start(ip, localRpcPort, () => {
			close?.();
		});
		fileSender.bind(ip, localFilePort);
	}
	let openNetDevice = async (ip: string, close: () => void) => {
		await rpcClient.start(ip, config.rpcPort, () => {
			close?.();
		});
		fileSender.bind(ip, config.filePort);
	}


	new DebugRegist(context).init({
		debugActor,
		closeDevice: async () => {
			rpcClient.close();
		},
		openDevice: async (address: string, ip: string, device: string, close: () => void) => {
			if (device == 'adb') {
				await openAdbDevice(address, ip, close);
			}
			if (device == 'net') {
				await openNetDevice(ip, close);
			}
			return address;
		},
		listDevices: async () => {
			let list = await Promise.all([ideInstaller.listAdbDevices(), scanClient.listNetDevices()]);
			return list.flatMap(item => item);
		},
		pushAttach: async () => {
			await updateAttachFile();
		},
		pushUI: () => {
			let name = config.workspaceName;
			let uiXml = runPackager.getUIXml();
			serviceApi.updateUI({ name, xml: uiXml });
		}
	});
}


export function deactivate() {
}