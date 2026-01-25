import { getNotUsedPort } from "../util/Nets";
import * as fs from 'fs';
import * as url from 'url';
import * as http from 'http';
import path = require('path');
import * as vscode from 'vscode';
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});
const getMimeType = (ext: string): string => {
    const mimeTypes: { [key: string]: string } = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
    };
    return mimeTypes[ext] || 'text/plain';
}
const getWebViewContent = (context: any, templatePath: any, url: any) => {
    const resourcePath = path.join(context.extensionPath, templatePath);
    let html = fs.readFileSync(resourcePath, 'utf-8');
    return html.replace("${IFRAME}", url);
}


class WebService {
    private context: vscode.ExtensionContext;
    private server: http.Server | undefined;
    private startPromise: Promise<string> | undefined;
    private proryMap:{[key:string]:string}
    constructor(context: vscode.ExtensionContext,proryMap:{[key:string]:string}) {
        this.context = context;
        this.proryMap = proryMap
    }

    private checkProxy(req:any,res:any,url?:string):boolean{
        if(!url){
            return false;
        }
        for(let path in this.proryMap){
            if(url.startsWith(path)){
                proxy.web(req, res, { target: this.proryMap[path] });
                return true;
            }
        }
        return false;
    }

    private start(debug:boolean) {
        if (this.startPromise) {
            return this.startPromise;
        }
        this.startPromise = new Promise(async (c, e) => {
            if(debug){
                return c(`http://localhost:3000/picker`);
            }
            const port = await getNotUsedPort();
            const staticPath = path.join(this.context.extensionPath, 'web'); // 静态资源目录
            this.server = http.createServer((req, res) => {
                if(this.checkProxy(req,res,req.url)){
                    return;
                }
                const parsedUrl = url.parse(req.url || '/');
                let pathname = path.join(staticPath, parsedUrl.pathname || '');
                fs.stat(pathname, (err) => {
                    if (err) {
                        res.statusCode = 404;
                        res.end('Not Found');
                        return;
                    }
                    fs.readFile(pathname, (err, data) => {
                        if (err) {
                            res.statusCode = 500;
                            res.end('Server Error');
                        } else {
                            const ext = path.extname(pathname);
                            res.setHeader('Content-Type', getMimeType(ext));
                            res.end(data);
                        }
                    });
                });
            });
            this.context.subscriptions.push({
                dispose: () => {
                    if (this.server) {
                        this.server.close();
                        this.server = undefined;
                        console.log('[服务] 已随VS Code关闭自动终止');
                    }
                }
            });
            this.server.on('error', (err) => { throw `服务器错误：${err.message}` });
            this.server.listen(port,()=>{
                c(`http://localhost:${port}/{module}/index.html`);
            });
        });
        return this.startPromise;
    }

    public async getWebViewContent(module: string,debug:boolean):Promise<string>{
        let url = await this.start(debug);
        url = url.replace('{module}', module);
        return getWebViewContent(this.context, 'web/webview.html', url);
    }

}

export{
    WebService
}