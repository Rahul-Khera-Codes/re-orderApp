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
import {AlertController} from 'ionic-angular';
import {Keyboard} from '@ionic-native/keyboard';

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
    spin: boolean = false;
    spinBarcode: boolean = false;
    synErr: boolean = false;
    isRemember: boolean = false;
    result;
    laser: string;
    spinForLaser: boolean = false;
    constructor(private keyboard: Keyboard, public alertCtrl: AlertController, public _local: LocalDbProvider, public _isLogin: IsLoginEventHandlerProvider, public _storage: LocalStorageProvider, public viewCtrl: ViewController, private _toast: ToastProvider, private _consignmentProvider: ConsignmentProvider, private _login: LoginProvider, private barcodeScanner: BarcodeScanner, public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder) {
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
            let userDetails: any = localStorage.getItem('userDetails') ? JSON.parse(localStorage.getItem('userDetails'))[0] : null;
            if (userDetails && (userDetails.Orderdirect == "true" || userDetails.Orderdirect == "1")) {
                let confirm = this.alertCtrl.create({
                    title: 'Please Select',
                    message: '',
                    buttons: [
                        {
                            text: 'Place Order',
                            handler: () => {
                                console.log('Disagree clicked');
                                this.navCtrl.setRoot(ConsignmentInPage, {"selectedConsignment": consignmentList[0], "selection": 1}, {animate: false});
                            }
                        },
                        {
                            text: 'Record Usage',
                            handler: () => {
                                console.log('Agree clicked');
                                this.navCtrl.setRoot(ConsignmentInPage, {"selectedConsignment": consignmentList[0], "selection": 0}, {animate: false});
                            }
                        }
                    ]
                });
                //                let ref = confirm;
                confirm.present();
                confirm.onDidDismiss(data => {
                    //                    ref.present();
                })
            } else {
                this.navCtrl.setRoot(ConsignmentInPage, {"selectedConsignment": consignmentList[0], "default": true, "selection": ""}, {animate: false});
            }
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
        this.synErr = false;
        this.err = null;
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
                    this.err = res['message'];
                    this.spin = false;
                }
            }, (err) => {
                this.authLogin(formData);
                this.synErr = true;
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
            this.err = this.synErr ? 'Could not access the Web Server' : err;
        })
    }
    openBarCode() {
        this.synErr = false;
        this.spinBarcode = true;
        this.barCodeErr = null;
        this.barcodeScanner.scan().then((barcodeData) => {
            this.barcodeData = barcodeData;
            this._local.callDBtoManage({barCode: barcodeData.text}).then((res) => {
                if (!res['message']) {
                    this.authLoginByBarcode(barcodeData)
                } else {
                    this.spinBarcode = false;
                    this.barCodeErr = res['message'];
                }
            }, (err) => {
                this.authLoginByBarcode(barcodeData)
                this.synErr = true;
            })
        }, (err) => {
            //            this.barCodeErr = err;
            // An error occurred
        });
    }
    redirect(keyCode) {
        if (typeof keyCode == 'number' && keyCode == 13) {
            this.spinForLaser = true;
            this.keyboard.close();
            if (this.laser && this.laser.length) {
                this._local.callDBtoManage({barCode: this.laser}).then((res) => {
                    if (!res['message']) {
                        this.authLoginByBarcode({text: this.laser})
                    } else {
                        this.spinBarcode = false;
                        this.laser = null;
                        this.spinForLaser = false;
                        this.barCodeErr = res['message'];
                    }
                }, (err) => {
                    this.authLoginByBarcode({text: this.laser})
                    this.synErr = true;
                })
            }
        }
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
                this.spinBarcode = false;
                this.spinForLaser = false;
                this._toast.presentToast("Login Successful", 2000);
            }
        }, (err) => {
            this.spinBarcode = false;
            this.laser = null;
            this.spinForLaser = false;
            this.barCodeErr = this.synErr ? 'Could not access the Web Server' : err;
        })
    }
}
