import {Component, OnInit} from '@angular/core';
import {NavParams, ViewController} from 'ionic-angular';

@Component({
    selector: 'page-popup',
    templateUrl: 'popup.html'
})
export class ReScanPage implements OnInit {
    message: string;
    constructor(public viewCtrl: ViewController, public _navParams: NavParams) {
    }
    ionViewWillEnter() {
    }
    ngOnInit() {
        this.message = this._navParams.get('data');
    }
    dismiss() {
        this.viewCtrl.dismiss(false);
    }
    reSubmit() {
        this.viewCtrl.dismiss(true);
    }
}
