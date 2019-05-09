import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {ConsignmentInPage} from '../consignment-in/consignment-in';
@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    private consignmentList: object | null;
    constructor(public navParams: NavParams, public navCtrl: NavController) {
        this.consignmentList = this.navParams.get('consignmentList');
    }
    itemSelected(selectedConsignment) {
        this.navCtrl.push(ConsignmentInPage,{"selectedConsignment":selectedConsignment});
    }

}
