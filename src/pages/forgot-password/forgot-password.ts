import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {FormBuilder, Validators} from '@angular/forms';
import {ApiServiceProvider} from '../../providers/api-service/api-service';
import {LoginProvider} from '../../providers/login/login';
import {ToastProvider} from './../../providers/toast/toast';
import {url} from '../../providers/config/config';

@Component({
    selector: 'page-forgot-password',
    templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {
    forgotform: any;
    spin: boolean = false;
    response: any;
    show_form: boolean = false;
    btnShow: boolean = true;
    email: string;
    constructor(private _toast: ToastProvider, private _login: LoginProvider, private _apiProvider: ApiServiceProvider, private _fb: FormBuilder, public navCtrl: NavController, public navParams: NavParams) {
        let email = this.navParams.get("email");
        this.validateEmail(email)
    }

    validateEmail(email) {
        this.forgotform = this._fb.group({
            email: [email, Validators.required]
        });
    }
    forgot(value: any) {
        this.spin = true;
        let rand = Math.random() * 1000000;
        let pwd = Math.ceil(rand);
        //this._login.encryptPassword(
        value['password'] = pwd;
        this._apiProvider.apiCallByPut(`${url.url}/forget/password`, value).subscribe(res => {
            value['password'] = pwd;
            this._login.updatePasswordWhenForgot(value['password'], value['email']).then((res) => {
                this._toast.presentToast("please check your mail id to reset your password", 2000);
            }, (err) => {
                this._toast.presentToast("Some thing went wrong", 2000);
            })
        }, (err) => {
            this._toast.presentToast(err, 2000);
        })
    }
}


