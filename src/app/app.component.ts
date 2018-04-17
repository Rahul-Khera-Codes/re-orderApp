import {Component, ViewChild} from '@angular/core';
import {Platform, Events, IonicApp, App} from 'ionic-angular';
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
import {NetworkProvider} from '../providers/networkWatch/network';
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
    backPressed: boolean = false;
    laserScan = true;
    browser=false;
    constructor(private _net: NetworkProvider, private app: App, private ionicApp: IonicApp, public events: Events, private _event: EventProvider, private _isLogin: IsLoginEventHandlerProvider, private network: Network, public _export: ExportDataProvider, private _consignmentProvider: ConsignmentProvider, private _ngZone: NgZone, private _storage: LocalStorageProvider, private _consignmentService: ConsignmentProvider, private _toast: ToastProvider, private _apiProvider: ApiServiceProvider, private _sqlService: SqlLiteProvider, private sqlitePorter: SQLitePorter, private _menuCtrl: MenuController, public _sqlLiteservice: SqlLiteProvider, public platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
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
        this.platform.ready().then(() => {
            localStorage.setItem("displayMode", 'Landscape');
            localStorage.setItem("laserScan", 'true');
            statusBar.styleDefault();
            splashScreen.hide();
            this._menuCtrl.enable(true);
            this.loginBy = this._consignmentService.checkLoginBy();
            this.network.onConnect().subscribe(() => {
                this.exportErr = localStorage.getItem("fail");
                this._net.set(true);
                if (localStorage.getItem("fail") != undefined) {
                    this._export.exportData();
                }
            });
            this.network.onDisconnect().subscribe(() => {
                this._net.set(false);
            })
        });
        this.checkBackButton();
    }
    checkBackButton() {
        this.platform.registerBackButtonAction(() => {
            let ready = true;
            if (this.myNav.canGoBack()) {
                let activePortal = this.ionicApp._loadingPortal.getActive() ||
                    this.ionicApp._modalPortal.getActive() ||
                    this.ionicApp._toastPortal.getActive() ||
                    this.ionicApp._overlayPortal.getActive();
                if (activePortal) {
                    ready = false;
                    var refVar = activePortal;
                    activePortal.dismiss();
                    activePortal = refVar;
                    //                    activePortal.onDidDismiss(() => {ready = true;});
                } else {
                    this.myNav.pop();
                }
            } else {
                if (!this.backPressed) {
                    this.backPressed = true;
                    this._toast.presentToast('Press Again To Exit App', 3000);
                    setTimeout(() => this.backPressed = false, 2000);
                    return;
                } else {
                    navigator['app'].exitApp();
                }
            }
        }, 100);
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
    setScan(laserScan) {
        if (laserScan) {
            localStorage.setItem("laserScan", 'true');
            this._event.setScanEvent();
        } else {
            localStorage.setItem("laserScan", 'false');
            this._event.setScanEvent();
        }
    }
    setBrowser(browser) {
        if (browser) {
            localStorage.setItem("defaultBrowser", 'true');
            this._event.setBrowserEvent();
        } else {
            localStorage.setItem("defaultBrowser", 'false');
            this._event.setBrowserEvent();
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

