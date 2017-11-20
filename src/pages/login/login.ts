import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {EmailValidator} from '../../validation/emailValidate';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {HomePage} from '../home/home';
@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage {
    private loginform: FormGroup;
    login = "custom";
    barcodeData: object;
    err: string;
    constructor(private barcodeScanner: BarcodeScanner, public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder) {
        this.loginform = this.formBuilder.group({
            password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
            email: ['', Validators.compose([Validators.maxLength(50), EmailValidator.isValidMailFormat, Validators.required])],
        });
    }

    ionViewDidLoad() {
    }
    signin(formData) {
        this.navCtrl.setRoot(HomePage);
    }
    openBarCode() {
        this.barcodeScanner.scan().then((barcodeData) => {
            this.barcodeData = barcodeData;
        }, (err) => {
            console.log("err", err)
            this.err = err;
            // An error occurred
        });
    }
}
