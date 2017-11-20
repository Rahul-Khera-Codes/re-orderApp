import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {AlertController} from 'ionic-angular';
/**
 * Generated class for the ConsignmentInPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-consignment-in',
    templateUrl: 'consignment-in.html',
})
export class ConsignmentInPage {
    barcodeData: object;
    err: string;
    myInput;
    myInputEnable: boolean = false;
    textID;
    products = [
        {
            "id": 1,
            "name": "product1",
            "qty": 1
        }, {
            "id": 2,
            "name": "product2",
            "qty": 1
        }, {
            "id": 3,
            "name": "product3",
            "qty": 1
        }, {
            "id": 4,
            "name": "product4",
            "qty": 1
        }
    ];
    productsRef: any = this.products;
    constructor(public alertCtrl: AlertController,private barcodeScanner: BarcodeScanner, public navCtrl: NavController, public navParams: NavParams) {
    }

    ionViewDidLoad() {
    }
    buttonClick() {
        if (this.textID && this.textID.length) {
            this.myInputEnable = true;
        }
    }
    openBarCode() {
        this.barcodeScanner.scan().then((barcodeData) => {
            this.barcodeData = barcodeData;
        }, (err) => {
            console.log("err", err)
            this.err = err;
            // An error occurred
        });
    }
    addItemByBarcode() {
        this.barcodeScanner.scan().then((barcodeData) => {
            let prompt = this.alertCtrl.create({
                title: 'Quentity',
                message: "Enter a quentity for this product you're so keen on adding",
                inputs: [
                    {
                        name: 'qty',
                        placeholder: 'qty',
                        type: 'number'
                    },
                ],
                buttons: [
                    {
                        text: 'Cancel',
                        handler: data => {
                            console.log('Cancel clicked');
                        }
                    },
                    {
                        text: 'Submit',
                        handler: dataOfQty => {
                            if (dataOfQty.qty == '0') {                    //check selected quantity should not 0
                                return false;
                            } else {
                                let data: any = {};
                                let length = this.products.length;
                                data['id'] = length++;
                                data['name'] = barcodeData.text;
                                data['qty'] = dataOfQty.qty;
                                this.products.push(data);
                            }
                        }
                    }
                ]
            });
            prompt.present();

        }, (err) => {
            this.err = err;
            // An error occurred
        });
    }
    searchProduct(ev: any) {
        this.products = this.productsRef;
        let val = ev.target.value;
        if (val && val.trim() != '') {
            this.products = this.products.filter((item) => {
                return (item['name'].toLowerCase().indexOf(val.toLowerCase()) > -1);
            })
        }
    }
    onSearchCancel() {
        this.myInput = '';
        this.products = this.productsRef;
    }
}
