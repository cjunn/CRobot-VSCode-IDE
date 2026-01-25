import { base64ToUInt8, uInt8ToBase64 } from "../util/Base64s";
import { DBUtil } from "../util/DBUtil";
import { isExitsFile, readFile, removeFile, saveFile } from "../util/Files";
import { Point } from "./Point";
import { sep as SEP } from 'path';
import * as uuid from 'node-uuid';
const TYPE_MUL = "mul";
const TYPE_FIX = "fix";
const TYPE_SWI = "swi";
class PointManager {
	async queryPhoto(id: number) {
        let p = await this.getPoint(id);
        if(!p){
            return "";
        }
        let path = this.photoDir + SEP + p.previed;
        if (!isExitsFile(path)) {
            return "";
        }
        let uint8 = new Uint8Array(readFile(path));
        return uInt8ToBase64(uint8);
	}
    private photoDir: string;
    private dbUtil: DBUtil;
    constructor({ dDbFile, photoDir }: { dDbFile: string, photoDir: string }) {
        this.photoDir = photoDir;
        this.dbUtil = new DBUtil(dDbFile)
    }

    public async close(){
        await this.dbUtil.close();
    }


    public async init() {
        await this.dbUtil.run(`CREATE TABLE IF NOT EXISTS points (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "name" TEXT,
            "type" TEXT,
            "fbl" TEXT,
            "date" TEXT,
            "x1" integer,
            "y1" integer,
            "x2" integer,
            "y2" integer,
            "swit" integer,
            "color" TEXT,
            "feature" TEXT,
            "dir" integer,
            "sim" real,
            "rx" integer,
            "ry" integer,
            "dx" integer,
            "dy" integer,
            "previed" TEXT,
            "exColor" TEXT,
            "exFeature" TEXT,
            "tolerance" real
        );`, []);
    }

    private savePointPhoto(p: Point) {
        if (TYPE_MUL == p.type && p.previed) {
            const uuid4 = uuid.v4() + '.jpg';
            let path = this.photoDir + SEP + uuid4 ;
            saveFile(path, base64ToUInt8(p.previed));
            return uuid4;
        }
    }

    public async addPoint(point: Point) {
        let img = this.savePointPhoto(point);
        await this.dbUtil.run(`INSERT INTO points (name,type,fbl,date,x1,y1,x2,y2,swit,color,feature,dir,sim,rx,ry,dx,dy,previed,exColor,exFeature,tolerance) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
            point.name,
            point.type,
            point.fbl,
            point.date,
            point.x1,
            point.y1,
            point.x2,
            point.y2,
            point.swit,
            point.color,
            point.feature,
            point.dir,
            point.sim,
            point.rx,
            point.ry,
            point.dx,
            point.dy,
            img,
            point.exColor,
            point.exFeature,
            point.tolerance
        ])
    }

    public async getPoint(id:number):Promise<Point|null> {
        let sql = `SELECT * FROM points where id=${id}`;
        let ret = await this.dbUtil.all(sql, []);
        if(!ret){
            return null;
        }
        return ret.length>=0?ret[0] as Point:null;
    }

    public async delPoint(id:number):Promise<number> {
        let p = await this.getPoint(id);
        if(p&&p.previed){
            let path = this.photoDir + SEP + p.previed ;
            removeFile(path);
        }
        let sql = `DELETE FROM points where id=${id}`;
        return await this.dbUtil.run(sql, []);
    }


    public async queryPointList({ name, fbl, type }: { name?: string, fbl?: string, type?: string }) {
        let sql = `SELECT * FROM points where 1=1`;
        if (name) {
            sql += ` and name like '%${name}%'`
        }
        if (fbl) {
            sql += ` and fbl ='${fbl}'`
        }
        if (type) {
            sql += ` and type ='${type}'`
        }
        return await this.dbUtil.all(sql, []);
    }
}


export {
    PointManager
}