import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {AlertController} from 'ionic-angular';
import {ProductProvider} from './../../providers/product/product';
import {UUID} from 'angular2-uuid';
import {Geolocation} from '@ionic-native/geolocation';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import {ConsignmentProvider} from './../../providers/consignment/consignment';
import {constantUserType} from './../../providers/config/config';

@Component({
    selector: 'page-consignment-in',
    templateUrl: 'consignment-in.html',
})
export class ConsignmentInPage {
    barcodeData: object;
    err: string;
    myInput;
    myInputEnable: boolean = false;
    jobID;
    products: any;
    productsRef: any;
    selectedConsignment: any;
    productControlLineData: any
    usageLineDataStore = [];
    usageData = {
        "jobID": "",
        "latitude": 0,
        "longitude": 0,
        "currentData": "",
        "listIDLocal": "",
        "IDLocal": "",
        "contactIDLocal": -1,
        "customerIDLocal": -1
    }
    constructor(private _consignmentProvider: ConsignmentProvider, private geolocation: Geolocation, private _productProvider: ProductProvider, public alertCtrl: AlertController, private barcodeScanner: BarcodeScanner, public navCtrl: NavController, public navParams: NavParams) {
        this.selectedConsignment = this.navParams.get('selectedConsignment');
        if (this.selectedConsignment) {
            this._productProvider.queryToProductControlLine(this.selectedConsignment.IDWeb, this.selectedConsignment.IDLocal).then((productControlLineData) => {
                this.productControlLineData = productControlLineData;
                this._productProvider.getProductDetailsByQueryProduct(productControlLineData).then((productDetails) => {
                    forEach(productDetails, (value) => {
                        value['qty'] = 0;
                    })
                    this.products = productDetails;
                    this.productsRef = productDetails;
                }, (err) => {
                    console.log(err);
                })
            })
        }
        this.getLocation();
    }
    getLocation() {
        this.geolocation.getCurrentPosition().then((resp) => {
            this.usageData['latitude'] = resp.coords.latitude;
            this.usageData['longitude'] = resp.coords.longitude;
        }).catch((error) => {
            console.log('Error getting location', error);
        });
    }

    ionViewDidLoad() {
    }
    buttonClick() {
        if (this.usageData['jobID'] && this.usageData['jobID'].length) {
            this.myInputEnable = true;
        } else {
            this.myInputEnable = false;
        }
    }
    createIDLocal() {
        return UUID.UUID();
    }
    getCurentTimeDate() {
        let today = new Date();
        return (today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds());
    }
    userData() {
        return this._consignmentProvider.getUserData()[0];
    }
    addProductCreateData(productID, qty) {
        let usageLineData = {
            "qty": 0,
            "IDLocal": "",
            "productID": "",
            "usageIDLocal": "",
            "createdDateTime": ""
        }
        return new Promise((resolve, reject) => {
            this._consignmentProvider.checkUserType().then((userType) => {
                if (!this.usageData['IDLocal']) {
                    this.getLocation();
                    this.getCurentTimeDate();
                    this.usageData['listIDLocal'] = this.selectedConsignment['IDLocal'];
                    this.usageData['IDLocal'] = this.createIDLocal();
                    this.usageData['currentData'] = this.getCurentTimeDate();
                    if (userType == constantUserType['customer']) {
                        this.usageData['customerIDLocal'] = this.userData()['IDLocal'];
                    } else {
                        this.usageData['contactIDLocal'] = this.userData()['IDLocal'];
                    }
                }
                usageLineData['createdDateTime'] = this.getCurentTimeDate();
                usageLineData['usageIDLocal'] = this.usageData['IDLocal'];
                usageLineData['IDLocal'] = this.createIDLocal();
                usageLineData['qty'] = qty;
                usageLineData['productID'] = productID;
                resolve({"usageData": this.usageData, "usageLineData": usageLineData});
            })
        })
    }
    addQty(productID, qty) {
        this.addProductCreateData(productID, qty).then((data) => {
            this.usageLineDataStore.push(data['usageLineData'])
        })
    }
    submitProduct() {
        this._productProvider.queryToUsage(this.usageData).then((usageRes) => {
            this._productProvider.queryToUsageLine(this.usageLineDataStore).then((res) => {
                this.usageLineDataStore = [];
                this.usageData = {
                    "jobID": "",
                    "latitude": 0,
                    "longitude": 0,
                    "currentData": "",
                    "listIDLocal": "",
                    "IDLocal": "",
                    "contactIDLocal": -1,
                    "customerIDLocal": -1
                }
            })
        })
    }
    openBarCode() {
        this.barcodeScanner.scan().then((barcodeData) => {
            this.usageData['jobID'] = barcodeData.text;
            this.myInputEnable = true;
        }, (err) => {
            this.err = err;
        });
    }
    addItemByBarcode() {
        this.barcodeScanner.scan().then((barcodeData) => {
            let filterBarcodeData = filter(this.products, function (data) {
                if (data.Barcode1 == barcodeData.text) {
                    return data;
                } else if (data.Barcode2 == barcodeData.text) {
                    return data;
                } else if (data.Barcode3 == barcodeData.text) {
                    return data;
                } else {
                    return false;
                }
            })
            let prompt = this.alertCtrl.create({
                title: 'Quantity',
                message: "Enter a quantity for this product you're so keen on adding",
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
                                if (filterBarcodeData && filterBarcodeData.length) {
                                    filterBarcodeData[0]['qty'] = dataOfQty.qty;
                                }
                            }
                        }
                    }
                ]
            });
            prompt.present();
            if (filterBarcodeData && filterBarcodeData.length) {
                this.addQty(filterBarcodeData[0].productID, filterBarcodeData[0].qty);
            } else {
                this.products = [];
            }
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
                return (item['SearchText'].toLowerCase().indexOf(val.toLowerCase()) > -1);
            })
        }
    }
    onSearchCancel() {
        this.myInput = '';
        this.products = this.productsRef;
    }
}
