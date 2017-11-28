import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {HomePage} from '../home/home';
import {ConsignmentInPage} from '../consignment-in/consignment-in';
import {ApiServiceProvider} from '../../providers/api-service/api-service';
import {SqlLiteProvider} from '../../providers/sql-lite/sql-lite';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage {
    private loginform: FormGroup;
    login = "custom";
    barcodeData: object;
    err: string;
    constructor(private _apiProvider: ApiServiceProvider, private _sqlProvider: SqlLiteProvider, private barcodeScanner: BarcodeScanner, public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder) {
        this.loginform = this.formBuilder.group({
            password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
            email: ['', Validators.compose([Validators.maxLength(50), Validators.required])],
        });

    }

    ionViewDidLoad() {
    }
    consignmentCheck() {
        this._apiProvider.apiCall("consignmentList.json").subscribe(consignmentList => {
            if (consignmentList.consignment && consignmentList.consignment.length > 1) {
                this.navCtrl.setRoot(HomePage, {"consignmentList": consignmentList});
            } else {
                this.navCtrl.setRoot(ConsignmentInPage, {"selectedConsignment": consignmentList['consignment'][0]});
            }
        })
    }
    signin(formData) {
        this._sqlProvider.openDb().then((db: SQLiteObject) => {
            db.executeSql(`SELECT EmailAddress,Password FROM Customer_Table WHERE EmailAddress='${formData.email}'`, []).then((res) => {
                this.consignmentCheck();
            }).catch(e => console.log(e));
        })

    }
    openBarCode() {
        this.barcodeScanner.scan().then((barcodeData) => {
            this.barcodeData = barcodeData;
            this.consignmentCheck();
        }, (err) => {
            console.log("err", err)
            this.err = err;
            // An error occurred
        });
    }
}
