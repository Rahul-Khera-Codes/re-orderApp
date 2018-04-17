import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
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
import {Geolocation} from '@ionic-native/geolocation';
import {ProgressDetailsPage} from './../pages/progress-details/progress-details'
import {ToastProvider} from '../providers/toast/toast';
import {LocalDbProvider} from '../providers/local-db/local-db';
import {ChangePassword} from '../pages/changePassword/changePassword';
import {ForgotPasswordPage} from '../pages/forgot-password/forgot-password';
import {HeaderScroller} from '../directive/header/header-scroller';
import {SelectAll} from '../directive/selectText/selectText';
import {ProductViewPage} from './../pages/product-view/product-view';
import {ExportDataProvider} from '../providers/export-data/export-data';
import {Network} from '@ionic-native/network';
import {HideFabDirective} from '../directive/topScroll/hide-button-scroller';
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {ImageDirective} from './../directive/loadImage/load-image';
import {FileTransfer, FileTransferObject} from '@ionic-native/file-transfer';
import {File} from '@ionic-native/file';
import {IsLoginEventHandlerProvider} from '../providers/is-login-event-handler/is-login-event-handler';
import {EventProvider} from './../providers/event/event';
import {Toast} from '@ionic-native/toast';
import {PopupPage} from './../pages/popupForScan/popup';
import {PopupSuccessPage} from './../pages/popupForSuccess/popupSuccess';;
import {ReScanPage} from './../pages/rescanPopup/reScan';;
import {NetworkProvider} from '../providers/networkWatch/network';
import { Keyboard } from '@ionic-native/keyboard';

@NgModule({
    declarations: [
        MyApp,
        LoginPage,
        HomePage,
        ConsignmentInPage,
        ProgressDetailsPage,
        ChangePassword,
        ForgotPasswordPage,
        HeaderScroller,
        HideFabDirective,
        ImageDirective,
        ProductViewPage,
        PopupPage,
        PopupSuccessPage,
        ReScanPage,
        SelectAll
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot(MyApp)
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        LoginPage,
        ConsignmentInPage,
        ProgressDetailsPage,
        ChangePassword,
        ForgotPasswordPage,
        ProductViewPage,
        PopupPage,
        PopupSuccessPage,
        ReScanPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        BarcodeScanner,
        InAppBrowser,
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
        LocalDbProvider,
        ExportDataProvider,
        Network,
        FileTransfer,
        FileTransferObject,
        File,
        IsLoginEventHandlerProvider,
        EventProvider,
        Toast,
        NetworkProvider,
        Keyboard,
    ]
})
export class AppModule {}
