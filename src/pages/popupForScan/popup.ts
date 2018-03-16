import {Component, OnInit} from '@angular/core';
import {NavParams, ViewController} from 'ionic-angular';

@Component({
    selector: 'page-popup',
    templateUrl: 'popup.html'
})
export class PopupPage implements OnInit {
    data;
    qty = 0;
    constructor(public viewCtrl: ViewController, public _navParams: NavParams) {
    }
    ionViewWillEnter() {
    }
    ngOnInit() {
        this.data = this._navParams.get('data')
        this.qty = this.data.qty;
    }
    dismiss() {
        this.data.qty = this.qty;
        this.viewCtrl.dismiss(this.data);
    }
    submit() {
        this.viewCtrl.dismiss(this.data);
    }
    remove(productData) {
        if (productData['qty'] > 0) {
            productData['qty']--;
        } else {
            return false;
        }

    }
    onBlurMethod(data) {
        if (data.qty > 0) {

        } else {
            data.qty = this.qty;
        }
    }
    add(data) {
        data['qty']++;
    }
}
