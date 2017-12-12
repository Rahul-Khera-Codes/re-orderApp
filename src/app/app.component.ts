import {Component, ViewChild} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {LoginPage} from '../pages/login/login';
import {SqlLiteProvider} from '../providers/sql-lite/sql-lite';
import {NavController} from 'ionic-angular';
import {LocalDbProvider} from './../providers/local-db/local-db';
import {ConsignmentInPage} from '../pages/consignment-in/consignment-in';
import {ProductPage} from '../pages/product/product';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage: any = ProductPage;
    isPageRedirect: boolean = false;
    @ViewChild('myNav') nav: NavController

    constructor(public _local: LocalDbProvider, public _sqlLiteservice: SqlLiteProvider, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
        platform.ready().then(() => {
            statusBar.styleDefault();
            splashScreen.hide();
            this.importData();
        });
    }
    importData() {
//        this._local.callDBtoManage(this.nav);
    }
}

