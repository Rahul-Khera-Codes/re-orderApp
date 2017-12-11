import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {HomePage} from '../home/home';
import {ConsignmentInPage} from '../consignment-in/consignment-in';
import {LoginProvider} from '../../providers/login/login';
import {ConsignmentProvider} from '../../providers/consignment/consignment';
import {constantUserType} from './../../providers/config/config';
import {ToastProvider} from './../../providers/toast/toast';
import {ForgotPasswordPage} from './../forgot-password/forgot-password'
@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage {
    private loginform: FormGroup;
    login = "custom";
    barcodeData: object;
    err: string;
    barCodeErr: string;
    isConsignmentExist: boolean = false;
    constructor(private _toast: ToastProvider, private _consignmentProvider: ConsignmentProvider, private _login: LoginProvider, private barcodeScanner: BarcodeScanner, public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder) {
        this.loginform = this.formBuilder.group({
            password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
            email: ['', Validators.compose([Validators.maxLength(50), Validators.required])],
        });
    }

    ionViewDidLoad() {
    }
    forgotPassword(email) {
        this.navCtrl.push(ForgotPasswordPage, {email})
    }
    consignmentCheck(consignmentList) {
        if (consignmentList && consignmentList.length > 1) {
            this.isConsignmentExist = false;
            this.navCtrl.setRoot(HomePage, {"consignmentList": consignmentList});
        } else if (consignmentList && consignmentList.length < 1 && consignmentList.length != 0) {
            this.isConsignmentExist = false;
            this.navCtrl.setRoot(ConsignmentInPage, {"selectedConsignment": consignmentList[0]});
        } else {
            this._toast.presentToast("Consignment List Not Exist", 2000);
            this.isConsignmentExist = true;
        }
    }
    getConsignmentAndCheckUserType() {
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
    signin(formData) {
        this._login.authUserCustomer(formData.email, formData.password).then((response: any) => {
            this.err = null;
            if (response && response.rows.length) {
                this._toast.presentToast("Login Successful", 2000);
                this.getConsignmentAndCheckUserType();
            }
        }, (err) => {
            this._toast.presentToast("Invalid Login", 2000);
            this.err = err;
        })
    }
    openBarCode() {
        this.barcodeScanner.scan().then((barcodeData) => {
            this.barcodeData = barcodeData;
            this._login.authUserCustomerByBarCode(barcodeData.text).then((response: any) => {
                this.barCodeErr = null;
                if (response && response.rows.length) {
                    this.getConsignmentAndCheckUserType();
                }
            }, (err) => {
                console.log(err)
                this.barCodeErr = err;
            })
        }, (err) => {
            console.log("err", err)
            this.barCodeErr = err;
            // An error occurred
        });
    }
}
