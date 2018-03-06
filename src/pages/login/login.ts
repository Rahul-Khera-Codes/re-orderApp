import {Component} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {HomePage} from '../home/home';
import {ConsignmentInPage} from '../consignment-in/consignment-in';
import {LoginProvider} from '../../providers/login/login';
import {ConsignmentProvider} from '../../providers/consignment/consignment';
import {constantUserType} from './../../providers/config/config';
import {ToastProvider} from './../../providers/toast/toast';
import {ForgotPasswordPage} from './../forgot-password/forgot-password';
import {LocalStorageProvider} from '../../providers/local-storage/local-storage';
import {IsLoginEventHandlerProvider} from '../../providers/is-login-event-handler/is-login-event-handler'
import {LocalDbProvider} from '../../providers/local-db/local-db';

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
    relogin = false;
    preUserEmail: string;
    spin = false;
    isRemember: boolean = false;
    constructor(public _local: LocalDbProvider, public _isLogin: IsLoginEventHandlerProvider, public _storage: LocalStorageProvider, public viewCtrl: ViewController, private _toast: ToastProvider, private _consignmentProvider: ConsignmentProvider, private _login: LoginProvider, private barcodeScanner: BarcodeScanner, public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder) {
        this.relogin = this.navParams.get('relogin');
        this.preUserEmail = this.navParams.get('email');
        let userInfo = null;
        if (this._storage.getLocalStorageData('userInfo') && this._storage.getLocalStorageData('userInfo') != "null" && this._storage.getLocalStorageData('userInfo').length) {
            userInfo = JSON.parse(this._storage.getLocalStorageData('userInfo'));
            this.isRemember = true;
        }
        this.loginform = this.formBuilder.group({
            password: [userInfo ? userInfo['password'] : '', Validators.compose([Validators.required, Validators.minLength(6)])],
            email: [userInfo ? userInfo['email'] : '', Validators.compose([Validators.maxLength(50), Validators.required])],
        });
    }
    rememberMe() {
        if (!this.isRemember) {
            // this._storage.removeLocalStorageData('userInfo');
        }
    }
    dismiss() {
        let data = {'login': 'false'};
        this.viewCtrl.dismiss(data);
    }
    ionViewDidLoad() {
    }
    forgotPassword(email) {
        this.navCtrl.push(ForgotPasswordPage, {email}, {animate: false})
    }
    consignmentCheck(consignmentList) {
        if (consignmentList && consignmentList.length > 1) {
            this.isConsignmentExist = false;
            this._isLogin.eventGenraterForLogin();
            this.navCtrl.setRoot(HomePage, {"consignmentList": consignmentList}, {animate: false});
        } else if (consignmentList && consignmentList.length == 1) {
            this.isConsignmentExist = false;
            this._isLogin.eventGenraterForLogin();
            this.navCtrl.setRoot(ConsignmentInPage, {"selectedConsignment": consignmentList[0], "default": true}, {animate: false});
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
                    }, (err) => {
                        console.log("err", err)
                    })
                })
            }
        });
    }
    signin(formData) {
        if (!this.spin) {
            this._consignmentProvider.removeUserData();
            if (this.isRemember) {
                this._storage.setLocalStorageData('userInfo', formData);
            }
            this.spin = true;
            this._local.callDBtoManage(formData).then((res) => {
                if (!res['message']) {
                    this.authLogin(formData);
                } else {
                    this.err = 'user not found';
                    this.spin = false;
                }
            }, (err) => {
                this.authLogin(formData);
                this.err = err.err;
            })
        }
    }

    authLogin(formData) {
        this._login.authUserCustomer(formData.email, formData.password).then((response: any) => {
            this.err = null;
            this.spin = false;
            if (response && response['err']) {
                this._toast.presentToast(response['err'], 2000);
                this.err = response['err'];
            }
            if (response && response.rows.length) {
                if (formData.email == this.preUserEmail) {
                    let data = {'login': 'true'};
                    this._isLogin.eventGenraterForLogin();
                    this.viewCtrl.dismiss(data);
                } else {
                    this.getConsignmentAndCheckUserType();
                }
                this._toast.presentToast("Login Successful", 2000);
            }
        }, (err) => {
            this.spin = false;
            this.err = err;
        })
    }
    openBarCode() {
        this.barcodeScanner.scan().then((barcodeData) => {
            this.barcodeData = barcodeData;
            this._local.callDBtoManage({barCode: barcodeData.text}).then((res) => {
                if (!res['message']) {
                    this.authLoginByBarcode(barcodeData)
                } else {
                    this.barCodeErr = res['message'];
                }
            }, (err) => {
                this.authLoginByBarcode(barcodeData)
                this.err = err.err;
            })
        }, (err) => {
            //            this.barCodeErr = err;
            // An error occurred
        });
    }
    authLoginByBarcode(barcodeData) {
        this.barCodeErr = null;
        this._login.authUserCustomerByBarCode(barcodeData.text).then((response: any) => {
            if (response && response.rows.length) {
                if (response.rows.item(0).EmailAddress == this.preUserEmail) {
                    let data = {'login': 'true'};
                    this.viewCtrl.dismiss(data);
                } else {
                    this.getConsignmentAndCheckUserType();
                }
                this._toast.presentToast("Login Successful", 2000);
            }
        }, (err) => {
            console.log(err)
            this.barCodeErr = err;
        })
    }
}
