import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {LoginPage} from '../pages/login/login';
import {SqlLiteProvider} from '../providers/sql-lite/sql-lite';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage: any = LoginPage;

    constructor(public _sqlLiteservice: SqlLiteProvider, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
        platform.ready().then(() => {
            statusBar.styleDefault();
            splashScreen.hide();
            this._sqlLiteservice.createSqlLiteDB().then((res) => {
                if (res) {
                    this._sqlLiteservice.createSqlLiteTable().then(() => {
                        setTimeout(() => {
                            this._sqlLiteservice.manageSqlLiteData();
                        }, 500)
                    })
                }
            })
        });
    }
}

