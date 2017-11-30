import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {HomePage} from '../home/home';
import {ConsignmentInPage} from '../consignment-in/consignment-in';
import {ApiServiceProvider} from '../../providers/api-service/api-service';
import {LoginProvider} from '../../providers/login/login';
import {ConsignmentProvider} from '../../providers/consignment/consignment';
@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage {
    private loginform: FormGroup;
    login = "custom";
    barcodeData: object;
    err: string;
    constructor(private _consignmentProvider: ConsignmentProvider, private _login: LoginProvider, private _apiProvider: ApiServiceProvider, private barcodeScanner: BarcodeScanner, public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder) {
        this.loginform = this.formBuilder.group({
            password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
            email: ['', Validators.compose([Validators.maxLength(50), Validators.required])],
        });

    }

    ionViewDidLoad() {
    }
    consignmentCheck(consignmentList) {
        if (consignmentList && consignmentList.length > 1) {
            this.navCtrl.setRoot(HomePage, {"consignmentList": consignmentList});
        } else {
            this.navCtrl.setRoot(ConsignmentInPage, {"selectedConsignment": consignmentList[0]});
        }
    }
    signin(formData) {
        this._login.authUserCustomer(formData).then((response: any) => {
            if (response && response.rows.length) {
                this._consignmentProvider.checkUserType().then((consignmentList) => {
                    this.consignmentCheck(consignmentList);
                });
            }
        })
    }
    openBarCode() {
        this.barcodeScanner.scan().then((barcodeData) => {
            this.barcodeData = barcodeData;
            //            this.consignmentCheck();
        }, (err) => {
            console.log("err", err)
            this.err = err;
            // An error occurred
        });
    }
}
