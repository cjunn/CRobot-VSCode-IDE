import * as sqlite3 from 'sqlite3';
class DBUtil {
    private db: sqlite3.Database;
    constructor(path: string) {
        this.db = new sqlite3.Database(path);
    }

    public hasTable(tableName: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name = ?`, [tableName], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(!!row);
                    }
                });
            });
        });
    }

    public run(sql: string, params: any): Promise<number> {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run(sql, params, function (e) {
                    resolve(this.changes);
                });
            });
        });
    }

    public all(sql: string, params: any): Promise<unknown[]> {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.all(sql, params, (e, rows) => {
                    resolve(rows);
                });
            });
        });
    }

    public close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.close((e) => {
                resolve();
            });
        });
    }

}

export{
    DBUtil
}