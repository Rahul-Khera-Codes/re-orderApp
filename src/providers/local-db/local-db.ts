import {Injectable} from '@angular/core';
import {SqlLiteProvider} from './../../providers/sql-lite/sql-lite';
import {ProgressDetailsPage} from './../../pages/progress-details/progress-details';

@Injectable()
export class LocalDbProvider {
    constructor(public _sqlLiteservice: SqlLiteProvider) {}
    callDBtoManage(nav: any) {
        nav.push(ProgressDetailsPage)
        this._sqlLiteservice.createSqlLiteDB().then((res) => {
            if (res) {
                this._sqlLiteservice.createSqlLiteTable().then(() => {
                    this._sqlLiteservice.getAllTableDataFromLocal().then(() => {
                        this._sqlLiteservice.checkApiType("login").then((res)=>{})
                    })
                })
            }
        })
    }
}
