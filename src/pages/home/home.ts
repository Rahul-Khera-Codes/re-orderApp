import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {ConsignmentInPage} from '../consignment-in/consignment-in';
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {AlertController} from 'ionic-angular';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    private consignmentList: object | null;
    browser: any;
    constructor(public alertCtrl: AlertController, private iab: InAppBrowser, public navParams: NavParams, public navCtrl: NavController) {
        this.consignmentList = this.navParams.get('consignmentList');
        //         _.uniqBy(this.navParams.get('consignmentList'),"IDWeb");
    }
    itemSelected(selectedConsignment) {
        let userDetails: any = localStorage.getItem('userDetails') ? JSON.parse(localStorage.getItem('userDetails'))[0] : null;
        if ((userDetails && userDetails.Orderdirect == "true" && userDetails.addanyproduct == "true") || (userDetails && userDetails.Orderdirect == "1" && userDetails.addanyproduct == "1")) {
            let confirm = this.alertCtrl.create({
                title: 'Please Select',
                message: '',
                buttons: [
                    {
                        text: 'Place Order',
                        handler: () => {
                            console.log('Disagree clicked');
                            this.navCtrl.push(ConsignmentInPage, {"selectedConsignment": selectedConsignment, "selection": 'Place_Order'}, {animate: false});
                        }
                    },
                    {
                        text: 'Record Usage',
                        handler: () => {
                            console.log('Agree clicked');
                            this.navCtrl.push(ConsignmentInPage, {"selectedConsignment": selectedConsignment, "selection": 'Record_Usage'}, {animate: false});
                        }
                    }
                ]
            });
            confirm.present();
        } else {
            this.navCtrl.push(ConsignmentInPage, {"selectedConsignment": selectedConsignment, "selection": ""}, {animate: false});
        }
    }
    onClickImage(url) {
        this.browser = this.iab.create(url, '_blank', 'hardwareback=yes ,location=yes');
    }
}
