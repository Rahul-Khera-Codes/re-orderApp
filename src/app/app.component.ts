import {Component, ViewChild} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {LoginPage} from '../pages/login/login';
import {SqlLiteProvider} from '../providers/sql-lite/sql-lite';
import {NavController} from 'ionic-angular';
import {LocalDbProvider} from './../providers/local-db/local-db';
import {WishListPage} from '../pages/wish-list/wish-list';
import {ProductPage} from '../pages/product/product';
import {MobilePage} from '../pages/mobile/mobile';
@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage: any = MobilePage;
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

