import {Component} from '@angular/core';
import {MenuController, NavController} from 'ionic-angular';
import {SQLitePorter} from '@ionic-native/sqlite-porter';
import {SqlLiteProvider} from './../../providers/sql-lite/sql-lite';
import {SQLiteObject} from '@ionic-native/sqlite';
import {LocalDbProvider} from './../../providers/local-db/local-db';
import {ApiServiceProvider} from './../../providers/api-service/api-service';
import {ConstantTableName} from './../../providers/config/config';
import keys from 'lodash/keys';
import {ToastProvider} from './../../providers/toast/toast';
import {ChangePassword} from '../../pages/changePassword/changePassword';
import {ConsignmentProvider} from '../../providers/consignment/consignment';
import {LocalStorageProvider} from './../../providers/local-storage/local-storage';
import {LoginPage} from '../../pages/login/login';
import {NgZone} from '@angular/core';


@Component({
    selector: 'side-menu',
    templateUrl: 'side-menu.html'
})
export class SideMenuComponent {
    spin: boolean = false;
    isclick: boolean = false;
    loginBy: string;
    constructor(private _ngZone: NgZone, private _storage: LocalStorageProvider, private _consignmentService: ConsignmentProvider, private _toast: ToastProvider, private _apiProvider: ApiServiceProvider, private _local: LocalDbProvider, private _sqlService: SqlLiteProvider, private sqlitePorter: SQLitePorter, private _menuCtrl: MenuController, public _navController: NavController) { }
    ngOnInit() {
        this._menuCtrl.enable(true);
        this.loginBy = this._consignmentService.checkLoginBy();
    }
    importData() {
        if (!this.isclick) {
            this._local.callDBtoManage(this._navController);
        }
    }
    logout() {
        this._storage.resetLocalStorageData();
        this._navController.setRoot(LoginPage);
    }
    exportData() {
        if (!this.isclick) {
            this.isclick = true;
            this.spin = true;
            this._sqlService.openDb().then((db: SQLiteObject) => {
                this.sqlitePorter.exportDbToJson(db)
                    .then((res) => {
                        this.spin = false;
                        let exportData = res['data']['inserts'];
                        let key = keys(exportData);
                        let manageExportData = (data, callback) => {
                            let first_key = data.splice(0, 1)[0];
                            let sendData = {};
                            sendData['name'] = first_key;
                            //                            sendData['data'] = exportData[first_key];
                            if (sendData['name'] == ConstantTableName.usage || sendData['name'] == ConstantTableName.usageLine) {
                                let exportDataFinal = exportData[first_key];
                                sendData['data'] = exportDataFinal;
                                this._apiProvider.apiCallByPost('http://5.9.144.226:3031/save/data', sendData).subscribe(res => {
                                    //                                    this._sqlService.deleteRecord(sendData['name']).then((res) => {
                                    //                                    })
                                    if (data.length) {
                                        manageExportData(data, callback);
                                    } else {
                                        callback(true)
                                    }
                                }, (error) => {
                                    this._toast.presentToast("Error Occur", 2000);
                                    this._ngZone.run(() => {
                                        this.isclick = false;
                                        this.spin = false;
                                    })
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
                                this.isclick = false;
                                this.spin = false;
                            })
                        })
                    }).catch(e => console.error(e));
            })

        }
    }

    gotoChangePassword() {
        this._navController.push(ChangePassword);
    }
}
