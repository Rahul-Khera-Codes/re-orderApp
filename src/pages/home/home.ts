import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {ConsignmentInPage} from '../consignment-in/consignment-in';
@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    private consignmentList: object | null;
    consignment = [
        {
            "id": 1,
            "product": "Consignment1",
        }, {
            "id": 2,
            "product": "Consignment2",
        }, {
            "id": 3,
            "product": "Consignment3",
        }, {
            "id": 4,
            "product": "Consignment4",
        }
    ]


    constructor(public navCtrl: NavController) {
        if (this.consignment && this.consignment.length == 1) {
            this.consignmentList = this.consignment[0];
        }
    }
    itemSelected(data) {
        this.navCtrl.push(ConsignmentInPage);
    }

}
