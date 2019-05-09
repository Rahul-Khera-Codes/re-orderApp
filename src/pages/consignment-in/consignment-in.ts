import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, NavParams, ModalController} from 'ionic-angular';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {AlertController} from 'ionic-angular';
import {ProductProvider} from './../../providers/product/product';
import {UUID} from 'angular2-uuid';
import {Geolocation} from '@ionic-native/geolocation';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import findIndex from 'lodash/findIndex';
import {ConsignmentProvider} from './../../providers/consignment/consignment';
import {constantUserType} from './../../providers/config/config';
import {LocalStorageProvider} from './../../providers/local-storage/local-storage';
import {constantLoginBy} from './../../providers/config/config';
import {ToastProvider} from './../../providers/toast/toast';
import {Searchbar} from 'ionic-angular';
import {MenuController} from 'ionic-angular';
import {LoginPage} from './../login/login';

@Component({
    selector: 'page-consignment-in',
    templateUrl: 'consignment-in.html'
})
export class ConsignmentInPage implements OnInit {
    @ViewChild("searchbar") searchbar: Searchbar;
    barcodeData: object;
    err: string;
    myInput;
    isRemember: boolean = false;
    myInputEnable: boolean = false;
    jobID;
    products: any;
    productsRef: any;
    selectedConsignment: any;
    productControlLineData: any;
    usageLineDataStore = [];
    isFound: boolean = true;
    qty = 0;
    displayMode = 'Landscape'
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
    searchBar: boolean = false;
    isManualLogin = false;
    default: boolean = false;
    isLogin: boolean = false;
    constructor(public modalCtrl: ModalController, public _menuCtrl: MenuController, private _toast: ToastProvider, private _localStorage: LocalStorageProvider, private _consignmentProvider: ConsignmentProvider, private geolocation: Geolocation, private _productProvider: ProductProvider, public alertCtrl: AlertController, private barcodeScanner: BarcodeScanner, public navCtrl: NavController, public navParams: NavParams) {}
    ngOnInit() {
        this.checkLoginBy();
        this.selectedConsignment = this.navParams.get('selectedConsignment');
        this.default = this.navParams.get('default');
        if (this.selectedConsignment) {
            this._productProvider.queryToProductControlLine(this.selectedConsignment.IDWeb, this.selectedConsignment.IDLocal).then((productControlLineData) => {
                this.productControlLineData = productControlLineData;
                this._productProvider.getProductDetailsByQueryProduct(productControlLineData).then((productDetails) => {
                    let quantity = 0;
                    if (!this.isManualLogin) {
                        quantity = 1;
                    }
                    forEach(productDetails, (value) => {
                        value['qty'] = quantity;
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
    openMenu() {
        this._menuCtrl.open();
    }
    gotoSearch() {
        setTimeout(() => {
            this.searchbar.setFocus();
        }, 200);
        this.searchBar = true;
    }
    dismiss() {
        this.searchBar = false;
    }
    checkLoginBy() {
        if (this._consignmentProvider.checkLoginBy() == constantLoginBy.manual) {
            this.isManualLogin = true;
        } else {
            this.isManualLogin = false;
        }
    }

    getLocation() {
        this.geolocation.getCurrentPosition().then((resp) => {
            this.usageData['latitude'] = resp.coords.latitude;
            this.usageData['longitude'] = resp.coords.longitude;
        }).catch((error) => {
            console.log(error);
        });
    }
    remove(productData) {
        if (productData['qty'] > 0) {
            productData['qty']--;
            if (productData['qty'] == 0) {
                this.isDataExistINList(productData.ID, productData['qty'], true);
            } else {
                this.isDataExistINList(productData.ID, productData['qty']);
            }
        } else {
            return false;
        }

    }
    add(productData) {
        productData['qty']++;
        this.isDataExistINList(productData.ID, productData['qty']);
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
    addProduct(productID, qty) {
        this.isDataExistINList(productID, qty);
    }
    addQty(productID, qty) {
        this.addProductCreateData(productID, qty).then((data) => {
            this._toast.presentToast("Product Added Successfully", 3000);
            this.usageLineDataStore.push(data['usageLineData']);
        })
    }
    submit() {
        if (this.isLogin || this.selectedConsignment['ReLoginToSubmit'] && this.selectedConsignment['ReLoginToSubmit'] == "true") {
            let profileModal = this.modalCtrl.create(LoginPage, {relogin: true, email: this.userData()['EmailAddress']});
            profileModal.onDidDismiss(data => {
                if (data['login']) {
                    this.isLogin = data['login'];
                    this.submitSubFunction();
                }
            });
            profileModal.present();
        } else {
            this.submitSubFunction();
        }
    }

    submitSubFunction() {
        if (this.usageData && this.usageData['IDLocal']) {
            this._productProvider.queryToUsage(this.usageData).then((usageRes) => {
                this._productProvider.queryToUsageLine(this.usageLineDataStore).then((res) => {
                    this._toast.presentToast("Successfully Submited", 3000);
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

        } else {
            this._toast.presentToast("Nothing to submit", 3000);
        }
    }
    submitProduct() {
        this.submit();
    }
    submitProductByScan() {
        this.barcodeScanner.scan().then((barcodeData) => {
            //            if (barcodeData.text == "ok") {
            this.submit();
            //            }
        }, (err) => {
            this.err = err;
        });
    }
    openBarCode() {
        this.barcodeScanner.scan().then((barcodeData) => {
            this.usageData['jobID'] = barcodeData.text;
            this.myInputEnable = true;
        }, (err) => {
            this.err = err;
        });
    }

    checkBarCodeOnproduct(barcodeData) {
        return filter(this.products, function (data) {
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
    }
    addItemByBarcode() {
        let cancel = false;
        let filterBarcodeData;
        this.barcodeScanner.scan().then((barcodeData) => {
            filterBarcodeData = this.checkBarCodeOnproduct(barcodeData);
        }, (err) => {
            //            this.err = err;
            // An error occurred
        }).then(() => {
            if (filterBarcodeData && filterBarcodeData.length) {
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
                                cancel = true;
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
                                        this.isDataExistINList(filterBarcodeData[0].ID, filterBarcodeData[0].qty)
                                    }
                                }
                            }
                        }
                    ]
                });
                prompt.present();
            } else {
                this._toast.presentToast("Product Not Found", 3000);
                this.isFound = false;
            }
        })
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
    isDataExistINList(productID, qty, isPop?) {
        let data = {};
        data['productID'] = productID;
        let index = findIndex(this.usageLineDataStore, data);
        if (index == -1) {
            if (isPop) {

            } else {
                this.addQty(productID, qty);
            }
        } else {
            if (this.isManualLogin) {
                if (isPop) {
                    this.usageLineDataStore.splice(index, 1);
                    this._toast.presentToast("Item Deleted", 3000);
                } else {
                    this.usageLineDataStore[index].qty = qty;
                    this._toast.presentToast("Product Quantity Updated", 3000);
                }
            } else {
                this.usageLineDataStore[index].qty += qty;
                this._toast.presentToast("Product Quantity Updated", 3000);
            }
        }
    }
    addProductByBarcode() {
        this.barcodeScanner.scan().then((barcodeData) => {
            let filterBarcodeData = this.checkBarCodeOnproduct(barcodeData);
            if (filterBarcodeData && filterBarcodeData.length) {
                this.isDataExistINList(filterBarcodeData[0].ID, 1);
            } else {
                this._toast.presentToast("Product Not Found", 3000);
                this.isFound = false;
            }
        }, (err) => {
            this.err = err;
            // An error occurred
        });
    }
    onSearchCancel() {
        this.myInput = '';
        this.products = this.productsRef;
    }
}
