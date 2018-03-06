import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {ConsignmentInPage} from '../consignment-in/consignment-in';
import {InAppBrowser} from '@ionic-native/in-app-browser';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    private consignmentList: object | null;
    browser: any;
    constructor(private iab: InAppBrowser, public navParams: NavParams, public navCtrl: NavController) {
        this.consignmentList = this.navParams.get('consignmentList');;
    }
    itemSelected(selectedConsignment) {
        this.navCtrl.push(ConsignmentInPage, {"selectedConsignment": selectedConsignment}, {animate: false});
    }
    onClickImage(url) {
        this.browser = this.iab.create(url, '_blank', 'hardwareback=yes ,location=yes');
    }
}
