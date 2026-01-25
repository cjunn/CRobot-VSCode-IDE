import * as net from "net"
const checkPortNotUsed = async (port: number): Promise<boolean> => {
    // 创建服务并监听该端口
    return new Promise((c, e) => {
        var server = net.createServer().listen(port)
        server.on('listening', function () {
            server.close();
            c(true);
        });
        server.on('error', function (err) {
            server.close();
            c(false);
        });
    });
}

const getNotUsedPort = async (): Promise<number> => {
    while (true) {
        var port = parseInt((10000 + Math.random() * 30000) + "");
        if (await checkPortNotUsed(port)) {
            return port;
        }
    }
}

export{
    getNotUsedPort
}