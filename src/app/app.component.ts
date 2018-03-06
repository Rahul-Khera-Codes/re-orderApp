import {Component, ViewChild} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {LoginPage} from '../pages/login/login';
import {SqlLiteProvider} from '../providers/sql-lite/sql-lite';
import {Nav} from 'ionic-angular';
import {MenuController} from 'ionic-angular';
import {SQLitePorter} from '@ionic-native/sqlite-porter';
import {ApiServiceProvider} from './../providers/api-service/api-service';
import {EventProvider} from './../providers/event/event';
import {ToastProvider} from './../providers/toast/toast';
import {ChangePassword} from './../pages/changePassword/changePassword';
import {ConsignmentProvider} from './../providers/consignment/consignment';
import {LocalStorageProvider} from './../providers/local-storage/local-storage';
import {NgZone} from '@angular/core';
import {constantLoginBy} from './../providers/config/config';
import {ExportDataProvider} from './../providers/export-data/export-data';
import {Network} from '@ionic-native/network';
import {IsLoginEventHandlerProvider} from './../providers/is-login-event-handler/is-login-event-handler'
@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) myNav: Nav;
    rootPage: any = LoginPage;
    isPageRedirect: boolean = false;
    spin: boolean = false;
    isclick: boolean = false;
    loginBy: string;
    displayMode = 'Landscape';
    landscape: boolean = true;
    exportErr: boolean | null | string = null;
    menuDisplay: boolean = false;
    constructor(private _event: EventProvider, private _isLogin: IsLoginEventHandlerProvider, private network: Network, public _export: ExportDataProvider, private _consignmentProvider: ConsignmentProvider, private _ngZone: NgZone, private _storage: LocalStorageProvider, private _consignmentService: ConsignmentProvider, private _toast: ToastProvider, private _apiProvider: ApiServiceProvider, private _sqlService: SqlLiteProvider, private sqlitePorter: SQLitePorter, private _menuCtrl: MenuController, public _sqlLiteservice: SqlLiteProvider, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
        localStorage.setItem("displayMode", 'Landscape');
        this._apiProvider.apiInProcess.subscribe(isDone => {
            if (isDone) {
                this.exportErr = true;
            } else {
                this.exportErr = false;
            }
        })
        this._isLogin.isLogin.subscribe(data => {
            if (data) {
                this.menuDisplay = true;
            }
        })
        platform.ready().then(() => {
            statusBar.styleDefault();
            splashScreen.hide();
            this._menuCtrl.enable(true);
            this.loginBy = this._consignmentService.checkLoginBy();
            this.network.onConnect().subscribe(() => {
                this.exportErr = localStorage.getItem("fail");
                if (localStorage.getItem("fail") != undefined) {
                    this._export.exportData();
                }
            });
        });
    }
    //    importData() {
    //        if (!this.isclick) {
    //            this._local.callDBtoManage(this.myNav);
    //        }
    //    }
    setDisplayMode(event) {
        if (event) {
            this.displayMode = 'Landscape';
            localStorage.setItem("displayMode", 'Landscape');
            this._event.setEvent();
        } else {
            this.displayMode = 'Portrait';
            localStorage.setItem("displayMode", 'Portrait');
            this._event.setEvent();
        }
    }
    checkLoginBy() {
        if (this._consignmentProvider.checkLoginBy() == constantLoginBy.manual) {
            return true;
        } else {
            return false;
        }
    }
    logout() {
        this.menuDisplay = false;
        this._storage.resetLocalStorageData();
        this.myNav.setRoot(LoginPage);
        this._consignmentProvider.removeUserData();
    }
    exportData() {
        if (!this.isclick) {
            this.isclick = true;
            this.spin = true;
            this._export.exportData().then((res) => {
                this.isclick = false;
            }, (err) => {
                //                this.exportErr = true;
                this.isclick = false;
            })
        }
    }

    gotoChangePassword() {
        this.myNav.push(ChangePassword);
    }
}

