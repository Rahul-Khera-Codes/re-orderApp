import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    private consignmentList: object | null;
    consignment = [
        {
            "id": 1,
            "product": "product1",
            "qty": 1
        }, {
            "id": 2,
            "product": "product2",
            "qty": 1
        }, {
            "id": 3,
            "product": "product3",
            "qty": 1
        }, {
            "id": 4,
            "product": "product4",
            "qty": 1
        }
    ]
    constructor(public navCtrl: NavController) {
        if (this.consignment && this.consignment.length == 1) {
            this.consignmentList = this.consignment[0];
        }
        console.log(this.consignmentList)
    }
    selectedConsignment() {
        console.log(this.consignmentList)
    }
}
