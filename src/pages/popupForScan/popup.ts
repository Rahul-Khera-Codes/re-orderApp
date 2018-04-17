import {Component, OnInit} from '@angular/core';
import {NavParams, ViewController, ModalController} from 'ionic-angular';
import {PopupSuccessPage} from './../popupForSuccess/popupSuccess';

@Component({
    selector: 'page-popup',
    templateUrl: 'popup.html'
})
export class PopupPage implements OnInit {
    data;
    qty = 0;
    constructor(public modalCtrl: ModalController, public viewCtrl: ViewController, public _navParams: NavParams) {
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
        if (this.data.qty > 0) {
            this.data['flag'] = 1;
            let profileModal = this.modalCtrl.create(PopupSuccessPage, {data: "Successfully Submitted"}, {cssClass: "always-modalSuccess"});
            profileModal.present();
            profileModal.onDidDismiss((res) => {
                this.viewCtrl.dismiss(this.data);
            })
        } else {
            return false;
        }
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
