import {Injectable, ViewChild} from '@angular/core';
import {SqlLiteProvider} from './../../providers/sql-lite/sql-lite';
import {ProgressDetailsPage} from './../../pages/progress-details/progress-details';
//import {NavController} from 'ionic-angular';

@Injectable()
export class LocalDbProvider {
//    @ViewChild('myNav') nav: NavController;
    constructor(public _sqlLiteservice: SqlLiteProvider) {}
    callDBtoManage(nav: any) {
        nav.push(ProgressDetailsPage)
        this._sqlLiteservice.createSqlLiteDB().then((res) => {
            if (res) {
                this._sqlLiteservice.createSqlLiteTable().then(() => {
//                    this._sqlLiteservice.manageSqlLiteData();
                })
            }
        })
    }
}
