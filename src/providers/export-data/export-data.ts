import {Injectable} from '@angular/core';
import {constantLoginBy} from './../config/config';
import {SQLitePorter} from '@ionic-native/sqlite-porter';
import {SQLiteObject} from '@ionic-native/sqlite';
import {ApiServiceProvider} from './../api-service/api-service';
import {ConstantTableName} from './../config/config';
import keys from 'lodash/keys';
import {ToastProvider} from './../toast/toast';
import {SqlLiteProvider} from './../sql-lite/sql-lite';
//import {ConsignmentProvider} from './../consignment/consignment';
import {NgZone} from '@angular/core';
import {url} from '../config/config';

@Injectable()
export class ExportDataProvider {

    constructor(private _ngZone: NgZone, private sqlitePorter: SQLitePorter, public _sqlLiteservice: SqlLiteProvider, private _toast: ToastProvider, private _apiProvider: ApiServiceProvider, private _sqlService: SqlLiteProvider) {
    }

    exportData() {
        return new Promise((resolve, reject) => {
            this._sqlService.openDb().then((db: SQLiteObject) => {
                this.sqlitePorter.exportDbToJson(db)
                    .then((res) => {
                        let exportData = res['data']['inserts'];
                        let key = keys(exportData);
                        let manageExportData = (data, callback) => {
                            let first_key = data.splice(0, 1)[0];
                            let sendData = {};
                            sendData['name'] = first_key == 'Usage_Line' ? 'UsageLine' : first_key;
                            //                            sendData['data'] = exportData[first_key];
                            if (sendData['name'] == ConstantTableName.usage || sendData['name'] == ConstantTableName.usageLine) {
                                let exportDataFinal = exportData[first_key];
                                sendData['data'] = exportDataFinal;
                                sendData['ListIdLocal'] = localStorage.getItem('listIDLocal');
                                this._apiProvider.apiCallByPost(`${url.url}/save/data`, sendData).subscribe(res => {
                                    this._sqlService.deleteRecord(first_key).then((res) => {
                                    })
                                    if (data.length) {
                                        manageExportData(data, callback);
                                    } else {
                                        callback(true)
                                    }
                                }, (error) => {
                                    this._toast.presentToast("Error Occur", 2000);
                                    reject(true);
                                })
                            } else {
                                if (data.length) {
                                    manageExportData(data, callback);
                                } else {
                                    callback(true)
                                }
                            }
                        }
                        manageExportData(key, (response) => {
                            this._ngZone.run(() => {
                                this._toast.presentToast("Export Done", 2000);
                                resolve(true);
                            })
                        })
                    }).catch(e => console.error(e));
            })
        })
    }
}

