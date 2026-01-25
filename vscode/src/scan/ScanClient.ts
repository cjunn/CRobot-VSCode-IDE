import { RemoteInfo, Socket } from 'dgram';
const dgram = require('dgram');
const os = require('os');

function calculateBroadcastAddress(ip: string, netmask: string): string {
    const ipParts = ip.split('.').map(Number);
    const maskParts = netmask.split('.').map(Number);
    const broadcastParts: number[] = [];
    for (let i = 0; i < 4; i++) {
        broadcastParts.push(ipParts[i] & maskParts[i] | (~maskParts[i] & 0xff));
    }
    return broadcastParts.join('.');
}
function getAllBroadcastAddresses(): string[] {
    const interfaces = os.networkInterfaces();
    const broadcastAddresses: string[] = [];
    for (const iface of Object.values(interfaces)) {
        if (!iface) continue;
        for (const alias of iface as any) {
            const netInterface = alias;
            if (netInterface.family !== 'IPv4' || netInterface.internal || !netInterface.netmask) {
                continue;
            }
            const broadcast = calculateBroadcastAddress(netInterface.address, netInterface.netmask);
            broadcastAddresses.push(broadcast);
        }
    }
    if (broadcastAddresses.length === 0) {
        broadcastAddresses.push('255.255.255.255');
    }
    return [...new Set(broadcastAddresses)];
}

function sendBroadcastToAllNetworks(socket: Socket, port: number) {
    const BROADCAST_MESSAGE = Buffer.from('CROBOT');
    // 开启广播模式（关键）
    socket.setBroadcast(true);
    // 获取所有广播地址
    const broadcastAddresses = getAllBroadcastAddresses();

    // 向每个广播地址发送消息
    broadcastAddresses.forEach((broadcastAddr) => {
        socket.send(
            BROADCAST_MESSAGE,
            0,
            BROADCAST_MESSAGE.length,
            port,
            broadcastAddr,
            (err) => {
            }
        );
    });
}

class ScanClient {
    private port: number;

    constructor(port: number) {
        this.port = port;
    }


    async listNetDevices(): Promise<{ address: string;device: string;ip:string}[]> {
        return new Promise((resolve, reject) => { 
            const socket:Socket = dgram.createSocket('udp4')
            socket.bind(() => {
                let responseIps: { address: string;device: string;ip:string}[] = [];
                sendBroadcastToAllNetworks(socket, this.port);
                socket.on('message', (msg, rinfo) => {
                    if("CROBOT"==msg.toString()){
                        const address = rinfo.address; 
                        const device = 'net';
                        const ip = rinfo.address;
                        responseIps.push({address,device,ip});
                    }
                });
                setTimeout(() => {
                    socket?.close();
                    resolve(responseIps);
                }, 2500);
            });
        });
    }

}

export {
    ScanClient
}