import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {HomePage} from '../home/home';
import {ConsignmentInPage} from '../consignment-in/consignment-in';
import {LoginProvider} from '../../providers/login/login';
import {ConsignmentProvider} from '../../providers/consignment/consignment';
import {constantUserType} from './../../providers/config/config';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage {
    private loginform: FormGroup;
    login = "custom";
    barcodeData: object;
    err: string;
    isConsignmentExist: boolean = false;
    constructor(private _consignmentProvider: ConsignmentProvider, private _login: LoginProvider, private barcodeScanner: BarcodeScanner, public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder) {
        this.loginform = this.formBuilder.group({
            password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
            email: ['', Validators.compose([Validators.maxLength(50), Validators.required])],
        });
    }

    ionViewDidLoad() {
    }
    consignmentCheck(consignmentList) {
        if (consignmentList && consignmentList.length > 1) {
            this.isConsignmentExist = false;
            this.navCtrl.setRoot(HomePage, {"consignmentList": consignmentList});
        } else if (consignmentList && consignmentList.length < 1 && consignmentList.length != 0) {
            this.isConsignmentExist = false;
            this.navCtrl.setRoot(ConsignmentInPage, {"selectedConsignment": consignmentList[0]});
        } else {
            this.isConsignmentExist = true;
        }
    }
    signin(formData) {
        this._login.authUserCustomer(formData.email, formData.password).then((response: any) => {
            if (response && response.rows.length) {
                this._consignmentProvider.checkUserType().then((userType) => {
                    if (userType == constantUserType['customer']) {
                        this._consignmentProvider.queryToProductControlList().then((consignmentList) => {
                            this.consignmentCheck(consignmentList['list']);
                        })
                    } else {
                        this._consignmentProvider.queryListToContact().then((listToContact) => {
                            this._consignmentProvider.queryProductControlListContentLogin(listToContact).then((consignmentList) => {
                                this.consignmentCheck(consignmentList['list']);
                            })
                        })
                    }
                });
            }
        }, (err) => {
            console.log(err)
            this.err = err;
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
