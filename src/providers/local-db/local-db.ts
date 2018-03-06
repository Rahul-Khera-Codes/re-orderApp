import {Injectable} from '@angular/core';
import {SqlLiteProvider} from './../../providers/sql-lite/sql-lite';

@Injectable()
export class LocalDbProvider {
    constructor(public _sqlLiteservice: SqlLiteProvider) {}
    callDBtoManage(formData) {
        return new Promise((resolve, reject) => {
            this._sqlLiteservice.createSqlLiteDB().then((resConnection) => {
                if (resConnection) {
                    this._sqlLiteservice.createSqlLiteTable().then(() => {
                        this._sqlLiteservice.getAllTableDataFromLocal().then((data) => {
                            this._sqlLiteservice.checkApiType("xyz", formData).then((res) => {
                                resolve(res);
                            }, (err) => {
                                console.log("error")
                                reject({err: "synchronization failed"});
                            })
                        }, (err) => {
                            reject({err: "synchronization failed"});
                        })
                    }, (err) => {
                        reject({err: "synchronization failed"});
                    })
                }
            })
        })
    }
}
