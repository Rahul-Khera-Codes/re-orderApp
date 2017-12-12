import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-product',
  templateUrl: 'product.html',
})
export class ProductPage {
  productData: any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.productData = {
      name: 'Laminate Trimmer with case'
    }
  }

}
