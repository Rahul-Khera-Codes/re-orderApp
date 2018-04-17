import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, NavParams, ModalController} from 'ionic-angular';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {AlertController} from 'ionic-angular';
import {ProductProvider} from './../../providers/product/product';
import {Geolocation} from '@ionic-native/geolocation';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import findIndex from 'lodash/findIndex';
import {ConsignmentProvider} from './../../providers/consignment/consignment';
import {constantUserType} from './../../providers/config/config';
import {LocalStorageProvider} from './../../providers/local-storage/local-storage';
import {constantLoginBy} from './../../providers/config/config';
import {ToastProvider} from './../../providers/toast/toast';
import {Searchbar} from 'ionic-angular';
import {MenuController} from 'ionic-angular';
import {LoginPage} from './../login/login';
import {Content} from 'ionic-angular';
import {ExportDataProvider} from '../../providers/export-data/export-data';
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {EventProvider} from './../../providers/event/event';
import {PopupPage} from './../popupForScan/popup';
import {PopupSuccessPage} from './../popupForSuccess/popupSuccess';
import {ReScanPage} from './../rescanPopup/reScan';
import {ApiServiceProvider} from '../../providers/api-service/api-service';
import {Observable} from 'rxjs/Rx';
import {url} from '../../providers/config/config';
import {NetworkProvider} from '../../providers/networkWatch/network';
import * as _ from 'lodash';
import {Keyboard} from '@ionic-native/keyboard';

@Component({
    selector: 'page-product-view',
    templateUrl: 'product-view.html',
})
export class ProductViewPage {
    @ViewChild("searchbar") searchbar: Searchbar;
    @ViewChild(Content) content: Content;
    @ViewChild('focusInput') Input;
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
    displayMode = localStorage.getItem('displayMode');
    //    jobIdFocus = false;
    usageData = {
        "jobID": "",
        "latitude": 0,
        "longitude": 0,
        "currentData": "",
        "listIDLocal": "",
        "IDLocal": 0,
        "contactIDLocal": -1,
        "customerIDLocal": -1,
        "Orderdirect": 0,
        "Processed": 0
    }
    searchBar: boolean = false;
    isManualLogin = false;
    default: boolean = false;
    isLogin: boolean = false;
    jobIDErr: boolean = false;
    spin: boolean = true;
    browser: any;
    productCode: any = [];
    userDetails: any;
    request: any;
    count: number = 0;
    orderdirect = 0;
    start = 0;
    end = 20;
    productlength = 0;
    data: any;
    enableInfinite: boolean = true;
    infinite: any;
    spinForSearch: boolean = false;
    page: number = 1;
    searchCheck: boolean = false;
    valForSEarch = "";
    sub: string;
    defaultSearch = false;
    sacnType = localStorage.getItem('laserScan');
    browserDefault = 'false';
    laser;
    constructor(private keyboard: Keyboard, private _net: NetworkProvider, private _apiProvider: ApiServiceProvider, private _event: EventProvider, private iab: InAppBrowser, public _export: ExportDataProvider, public modalCtrl: ModalController, public _menuCtrl: MenuController, private _toast: ToastProvider, private _localStorage: LocalStorageProvider, private _consignmentProvider: ConsignmentProvider, private geolocation: Geolocation, private _productProvider: ProductProvider, public alertCtrl: AlertController, private barcodeScanner: BarcodeScanner, public navCtrl: NavController, public navParams: NavParams) {}

    ngOnInit() {
        if (!this.sacnType) {
            this.sacnType = 'true';
        }
        this._event.mode.subscribe(event => {
            this.displayMode = localStorage.getItem('displayMode');
        })
        this._event.brower.subscribe(event => {
            this.browserDefault = localStorage.getItem('defaultBrowser');
        })
        if (this.sacnType == 'true') {
            setTimeout(() => {
                this.Input.setFocus();
            }, 1000);
        }
        this._event.scan.subscribe(event => {
            this.sacnType = localStorage.getItem('laserScan');
            if (this.sacnType == 'true') {
                setTimeout(() => {
                    this.Input.setFocus();
                }, 500);
            }
        })
        this.checkLoginBy();
        this.selectedConsignment = this.navParams.get('selectedConsignment');
        this.usageData.jobID = this.navParams.get('jobID');
        this.usageData.Orderdirect = this.navParams.get('selection');
        this.orderdirect = this.usageData.Orderdirect;
        if (!this.orderdirect) {
            this.sub = "Submit Usage"
        } else {
            this.sub = "Place Order"
        }
        this.default = this.navParams.get('default');
        this.userDetails = localStorage.getItem('userDetails') ? JSON.parse(localStorage.getItem('userDetails'))[0] : null;
        if (this.selectedConsignment) {
            this._productProvider.queryToProductControlLine(this.selectedConsignment.IDWeb, this.selectedConsignment.IDLocal).then((productControlLineData) => {
                this.productControlLineData = productControlLineData;
                this._productProvider.getProductDetailsByQueryProduct(productControlLineData).then((productDetails: any) => {
                    let quantity = 0;
                    let productIdList = map(productDetails, 'ID');
                    this._productProvider.queryToProductCode(productIdList).then((productCode) => {
                        if (productCode) {
                            this.productCode = productCode;
                        }
                    })
                    forEach(productDetails, (value) => {
                        value['qty'] = quantity;
                    })
                    this.spin = false;
                    this.productsRef = JSON.parse(JSON.stringify(productDetails));
                    this.data = JSON.parse(JSON.stringify(productDetails));
                    this.products = this.data.splice(this.start, this.end);
                }, (err) => {
                    console.log(err);
                })
            })
        }
        if (!(this.userDetails.addanyproduct == '1' || this.userDetails.addanyproduct == 'true') && (this.orderdirect * 1)) {
            this.defaultSearch = true;
        }
        setTimeout(() => {
            this.getLocation();
        }, 2000)

    }
    changeOrderDirect() {
        if (!this.defaultSearch) {
            this.searchProduct({target: {value: this.myInput}});
        } else {
            this.searchAllProduct({target: {value: this.myInput}});
        }
    }
    scrollTop() {
        this.content.scrollToTop(1000);
    }
    openMenu() {
        this._menuCtrl.open();
    }
    gotoSearch() {
        setTimeout(() => {
            this.searchbar.setFocus();
        }, 500);
        this.searchBar = true;
    }

    dismiss() {
        this.isFound = true;
        this.myInput = '';
        this.data = JSON.parse(JSON.stringify(this.productsRef))
        this.products = this.data.splice(this.start, this.end);
        this.searchBar = false;
        this.searchCheck = false;
    }
    onClickImage(url) {
        if (this.browserDefault == 'false') {
            if (url != "null") {
                this.browser = this.iab.create(url, '_self', "hardwareback=yes,location=yes,toolbar=true,keyboardDisplayRequiresUserAction=no");
            }
        } else {
            if (url != "null") {
                window.open(url, '_system');
            } 
        }
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

    onBlurMethod(event,product) {
        if(product['qty']){
        if (product['qty'] > 0) {
            this.isDataExistINList(product.ID, product['qty']);
        } else {
            product['qty'] = 0;
        }
        }else {
            product['qty'] = 0;
        }
    }
    preventText(event){
        return event.charCode >= 48 && event.charCode <= 57;
    }
    ionViewDidLoad() {
    }
    //    buttonClick() {
    //        if (this.usageData['jobID'] && this.usageData['jobID'].length) {
    //            this.myInputEnable = true;
    //            this.jobIdFocus = false;
    //            this.jobIDErr = false;
    //        } else {
    //            this.jobIDErr = true;
    //            this.myInputEnable = false;
    //        }
    //    }
    createIDLocal() {
        return Math.floor(Math.random() * (999999 - 100000)) + 100000;
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
            "IDLocal": 0,
            "productID": "",
            "usageIDLocal": 0,
            "createdDateTime": "",
            "Orderdirect": this.orderdirect,
            "Processed": 0
        }
        return new Promise((resolve, reject) => {
            this._consignmentProvider.checkUserType().then((userType) => {
                if (!this.usageData['IDLocal']) {
                    this.getLocation();
                    this.getCurentTimeDate();
                    localStorage.setItem('listIDLocal', this.selectedConsignment['IDLocal']);
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
        if (this.usageData && this.usageData['IDLocal'] && this.usageLineDataStore.length) {
            if (this.isLogin || this.selectedConsignment['ReLoginToSubmit'] && this.selectedConsignment['ReLoginToSubmit'] == "true") {
                let profileModal = this.modalCtrl.create(LoginPage, {relogin: true, email: this.userData()['EmailAddress']});
                profileModal.onDidDismiss(data => {
                    if (data['login'] != "false") {
                        this.isLogin = data['login'];
                        this.submitSubFunction();
                    }
                });
                profileModal.present();
            } else {
                this.submitSubFunction();
            }
        } else {
            this._toast.presentToast("Nothing to submit", 3000);
        }
    }

    submitSubFunction() {
        if (this.usageData && this.usageData['IDLocal']) {
            this._productProvider.queryToUsage(this.usageData).then((usageRes) => {
                this._productProvider.queryToUsageLine(this.usageLineDataStore).then((res) => {
                    this._export.exportData().then(res => {});
                    let profileModal = this.modalCtrl.create(PopupSuccessPage, {data: "Successfully Submitted"}, {cssClass: "always-modalSuccess"});
                    profileModal.present();
                    this.navCtrl.pop({animate: false});
                    this.usageLineDataStore = [];
                    this.usageData = {
                        "jobID": "",
                        "latitude": 0,
                        "longitude": 0,
                        "currentData": "",
                        "listIDLocal": "",
                        "IDLocal": 0,
                        "contactIDLocal": -1,
                        "customerIDLocal": -1,
                        "Orderdirect": this.orderdirect,
                        "Processed": 0
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


    checkBarCodeOnproduct(barcodeData: any) {
        return new Promise((resolve, reject) => {
            if (typeof barcodeData.text != "string") {
                barcodeData.text = `${barcodeData.text}`;
            }
            let filter_data = filter(this.productsRef, (data: any) => {
                if (data && (data.Barcode1.toLowerCase() == barcodeData.text.toLowerCase())) {
                    return data;
                } else if (data && (data.Barcode2.toLowerCase() == barcodeData.text.toLowerCase())) {
                    return data;
                } else if (data && (data.Barcode3.toLowerCase() == barcodeData.text.toLowerCase())) {
                    return data;
                } else if (data && (data.Code.toLowerCase() == barcodeData.text.toLowerCase())) {
                    return data;
                } else {
                    return false;
                }
            })
            if (filter_data.length == 0) {
                if (this.productCode != "undefined" && this.productCode.length) {

                    this.productCodeFilter(this.productCode, barcodeData).then((code: any) => {
                        if (code && code.length) {
                            resolve(filter(this.productsRef, (data: any) => {
                                if (data && (data.ID.toLowerCase() == code[0].ProductIDLocal.toLowerCase())) {
                                    return data;
                                } else {
                                    return false;
                                }
                            }))
                        } else {
                            resolve(filter_data);
                        }
                    })
                } else {
                    resolve(filter_data);
                }
            } else {
                resolve(filter_data);
            }
        })
    }
    productCodeFilter(productCode, barcodeData) {
        return new Promise((resolve, reject) => {
            resolve(filter(this.productCode, (codeData: any) => {
                if (codeData.Barcode.toLowerCase() == barcodeData.text.toLowerCase()) {
                    return codeData;
                } else {
                    return false;
                }
            }));
        })
    }
    addItemByLaser(keyCode) {
        if (typeof keyCode == 'number' && keyCode == 13) {
            if (this.laser && this.laser.length) {
                this.keyboard.close();
                if (!this.defaultSearch) {
                    this.checkBarCodeOnproduct({text: this.laser}).then((filterBarcodeData: any) => {
                        this.isFound = true;
                        this.createPopupForScanSearch(filterBarcodeData);
                    }, (err) => {

                    });
                } else {
                    if (this._net.get()) {
                        this._apiProvider.apiCall(`${url.url}/search/barcode/${this.laser}`).subscribe(res => {
                            forEach(res.data, (value, key) => {
                                value['qty'] = 0;
                            });
                            let filterBarcodeData = res.data;
                            this.createPopupForScanSearch(filterBarcodeData);
                        });
                    } else {
                        this._toast.presentToast("Please cleck Network Connection", 3000);
                    }
                }
            }
        }
    }
    addItemByBarcode() {
        let cancel = false;
        this.isFound = true;
        let userDetails: any = localStorage.getItem('userDetails') ? JSON.parse(localStorage.getItem('userDetails'))[0] : null;
        this.barcodeScanner.scan().then((barcodeData) => {
            if (barcodeData.text) {
                if (!this.defaultSearch) {
                    this.checkBarCodeOnproduct(barcodeData).then((filterBarcodeData: any) => {
                        this.isFound = true;
                        this.createPopupForScanSearch(filterBarcodeData);
                    }, (err) => {

                    });
                } else {
                    if (this._net.get()) {
                        this._apiProvider.apiCall(`${url.url}/search/barcode/${barcodeData.text}`).subscribe(res => {
                            forEach(res.data, (value, key) => {
                                value['qty'] = 0;
                            });
                            let filterBarcodeData = res.data;
                            this.createPopupForScanSearch(filterBarcodeData);
                        });
                    } else {
                        this._toast.presentToast("Please cleck Network Connection", 3000);
                    }
                }
            }
        }, (err) => {
            console.log("error")
        })
    }

    createPopupForScanSearch(filterBarcodeData) {
        if (filterBarcodeData && filterBarcodeData.length) {
            let profileModal = this.modalCtrl.create(PopupPage, {data: filterBarcodeData[0]}, {cssClass: "always-modal"});
            let qty = filterBarcodeData[0].qty;
            profileModal.onDidDismiss((data) => {
                if (data && data.qty > 0) {
                    this.isDataExistINList(data.ID, data.qty);
                } else {
                    filterBarcodeData[0].qty = qty;
                    //                    this._toast.presentToast("Please add quantity", 3000);
                }
                if (data['flag']) {
                    delete data['flag'];
                    if (!data['flag']) {
                        if (this.sacnType == 'true') {
                            this.laser = null;
                            setTimeout(() => {
                                this.Input.setFocus();
                            }, 500);
                        } else {
                            this.addItemByBarcode();
                        }
                    }
                }
            });
            profileModal.present();
        } else {
            let profileModal = this.modalCtrl.create(ReScanPage, {data: "No Product Found"}, {cssClass: "always-modalSuccess"});
            profileModal.present();
            profileModal.onDidDismiss((data) => {
                if (data) {
                    if (this.sacnType == 'true') {
                        this.laser = null;
                        setTimeout(() => {
                            this.Input.setFocus();
                        }, 500);
                    } else {
                        this.addItemByBarcode();
                    }
                }
            })
        }
    }
    searchProduct(ev: any) {
        this.isFound = true;
        this.spinForSearch = true;
        this.doInfinite(this.infinite, true);
        //        this.products = this.productsRef;
        this.data = JSON.parse(JSON.stringify(this.productsRef))
        this.products = this.data.splice(this.start, this.end);
        let val = ev.target.value;
        this.spinForSearch = false;
        if (val && val.trim() != '') {
            let data = val.split(" ")
            this._productProvider.queryProduct(data).then((res) => {
                forEach(res, (value, key) => {
                    value['qty'] = 0;
                })
                this.data = res;
                this.products = this.data.splice(this.start, this.end);
                return this.products;
            });
        }
    }
    closeKeybord(keyCode) {
        if (typeof keyCode == 'number' && keyCode == 13) {
            this.keyboard.close();
        }
    }
    searchAllProduct(ev: any) {
        if (this._net.get()) {
            this.isFound = true;
            this.doInfinite(this.infinite, true);
            this.data = JSON.parse(JSON.stringify(this.productsRef))
            this.products = this.data.splice(this.start, this.end);
            this.searchCheck = false;
            //            this.products = this.productsRef;

            this.valForSEarch = ev.target.value;
            if (this.valForSEarch && this.valForSEarch.length) {
                this.searchCheck = true;
                this.spinForSearch = true;
                if (this.count > 0) {
                    this.request.unsubscribe();
                }
                this.count++;
                this.request = this._apiProvider.apiCall(`${url.url}/search/product/${this.valForSEarch}/${this.page}/${this.end}`).debounce((x) => {return Observable.timer(1000);}).subscribe(res => {
                    forEach(res.data, (value, key) => {
                        value['qty'] = 0;
                    })
                    this.spinForSearch = false;
                    //                this.products = res.data;
                    this.data = res.data;
                    this.products = this.data.splice(this.start, this.end);
                });
            }
        } else {
            this.spinForSearch = false;
            this._toast.presentToast("Please cleck Network Connection", 3000);
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
        this.isFound = true;
        this.barcodeScanner.scan().then((barcodeData) => {
            this.checkBarCodeOnproduct(barcodeData).then((filterBarcodeData: any) => {
                if (filterBarcodeData && filterBarcodeData.length) {
                    this.isDataExistINList(filterBarcodeData[0].ID, 1);
                } else {
                    this._toast.presentToast("Product Not Found", 3000);
                    this.isFound = false;
                }
                this.addProductByBarcode();
            }, (err) => {
                this.err = err;
                // An error occurred
            });
        });
    }
    addProductByLaser(keyCode) {
        if (typeof keyCode == 'number' && keyCode == 13) {
            if (this.laser.length) {
                this.keyboard.close();
                if (!this.defaultSearch) {
                    this.checkBarCodeOnproduct({text: this.laser}).then((filterBarcodeData: any) => {
                        if (filterBarcodeData && filterBarcodeData.length) {
                            this.isDataExistINList(filterBarcodeData[0].ID, 1);
                        } else {
                            this._toast.presentToast("Product Not Found", 3000);
                            this.isFound = false;
                            this.laser = null;
                            setTimeout(() => {
                                this.Input.setFocus();
                            }, 500);
                        }
                        this.laser = null;
                        setTimeout(() => {
                            this.Input.setFocus();
                        }, 500);
                    }, (err) => {
                        this.err = err;
                    });
                } else {
                    if (this._net.get()) {
                        this._apiProvider.apiCall(`${url.url}/search/barcode/${this.laser}`).subscribe(res => {
                            forEach(res.data, (value, key) => {
                                value['qty'] = 0;
                            });
                            let filterBarcodeData = res.data;
                            if (filterBarcodeData && filterBarcodeData.length) {
                                this.isDataExistINList(filterBarcodeData[0].ID, 1);
                            } else {
                                this._toast.presentToast("Product Not Found", 3000);
                                this.isFound = false;
                                this.laser = null;
                                setTimeout(() => {
                                    this.Input.setFocus();
                                }, 500);
                            }
                        });
                    } else {
                        this._toast.presentToast("Please cleck Network Connection", 3000);
                    }
                }
            }
        }
    }
    onSearchCancel() {
        this.isFound = true;
        this.myInput = '';
        this.data = JSON.parse(JSON.stringify(this.productsRef))
        this.products = this.data.splice(this.start, this.end);
        this.searchCheck = false;
    }
    doInfinite(infiniteScroll, check?) {
        this.infinite = infiniteScroll;
        if (check) {
            if (this.infinite) {
                infiniteScroll.complete();
                infiniteScroll.enable(true);
                return;
            } else {
                return;
            }
        }
        if (this.searchCheck) {
            if (this._net.get()) {
                let val = this.valForSEarch;
                this._apiProvider.apiCall(`${url.url}/search/product/${val}/${this.page + 1}/${this.end}`).debounce((x) => {return Observable.timer(1000);}).subscribe(res => {
                    forEach(res.data, (value, key) => {
                        value['qty'] = 0;
                    })
                    let data = res.data;
                    this.products = this.products.concat(data);
                    setTimeout(() => {
                        infiniteScroll.complete();
                    }, 100)
                    if (data.length < this.end) {
                        infiniteScroll.enable(false);
                    }
                });
            } else {
                this._toast.presentToast("Please cleck Network Connection", 3000);
            }
        } else {
            let data = this.data.splice(this.start, this.end);
            this.products = this.products.concat(data);
            setTimeout(() => {
                infiniteScroll.complete();
            }, 100)
            if (data.length < this.end) {
                infiniteScroll.enable(false);
            }
        }
    }
}
