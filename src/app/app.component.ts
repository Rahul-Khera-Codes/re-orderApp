import {Component, ViewChild} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {LoginPage} from '../pages/login/login';
import {SqlLiteProvider} from '../providers/sql-lite/sql-lite';
import {ProgressDetailsPage} from './../pages/progress-details/progress-details';
import {NavController} from 'ionic-angular';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage: any = LoginPage;
    isPageRedirect: boolean = false;
    @ViewChild('myNav') nav: NavController

    constructor(public _sqlLiteservice: SqlLiteProvider, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
        platform.ready().then(() => {
            statusBar.styleDefault();
            splashScreen.hide();
            this.importData();
        });
    }
    importData() {
        this._sqlLiteservice.createSqlLiteDB().then((res) => {
            if (res) {
                this.nav.push(ProgressDetailsPage);
                this._sqlLiteservice.createSqlLiteTable().then(() => {
                    this._sqlLiteservice.manageSqlLiteData();
                })
            }
        })
    }
}

