import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {LoginPage} from '../pages/login/login';
import {ConsignmentInPage} from '../pages/consignment-in/consignment-in';
import {ApiServiceProvider} from '../providers/api-service/api-service';
import {HttpClientModule} from '@angular/common/http';
import {SQLite} from '@ionic-native/sqlite';
import {SQLitePorter} from '@ionic-native/sqlite-porter';
import {SqlLiteProvider} from '../providers/sql-lite/sql-lite';
import {LoginProvider} from '../providers/login/login';
import {ConsignmentProvider} from '../providers/consignment/consignment';
import {ProductProvider} from '../providers/product/product';
import {LocalStorageProvider} from '../providers/local-storage/local-storage';
import {SideMenuComponent} from './../components/side-menu/side-menu';
import {Geolocation} from '@ionic-native/geolocation';
import {ProgressDetailsPage} from './../pages/progress-details/progress-details'
import {ToastProvider} from '../providers/toast/toast';
import {LocalDbProvider} from '../providers/local-db/local-db';
import {ChangePassword} from '../pages/changePassword/changePassword';
import {ForgotPasswordPage} from '../pages/forgot-password/forgot-password';
@NgModule({
    declarations: [
        MyApp,
        LoginPage,
        HomePage,
        ConsignmentInPage,
        SideMenuComponent,
        ProgressDetailsPage,
        ChangePassword,
        ForgotPasswordPage
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot(MyApp)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        LoginPage,
        ConsignmentInPage,
        ProgressDetailsPage,
        ChangePassword,
        ForgotPasswordPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        BarcodeScanner,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        ApiServiceProvider,
        SQLite,
        SQLitePorter,
        SqlLiteProvider,
        LoginProvider,
        ConsignmentProvider,
        ProductProvider,
        LocalStorageProvider,
        Geolocation,
        ToastProvider,
        LocalDbProvider]
})
export class AppModule {}
