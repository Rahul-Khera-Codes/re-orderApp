import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {ConsignmentProvider} from './../../providers/consignment/consignment';
import {constantLoginBy} from './../../providers/config/config';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {ProductViewPage} from './../product-view/product-view';
import {InAppBrowser} from '@ionic-native/in-app-browser';

@Component({
    selector: 'page-consignment-in',
    templateUrl: 'consignment-in.html'
})
export class ConsignmentInPage implements OnInit {
    @ViewChild('focusInput') myInput;
    isManualLogin = false;
    isLogin: boolean = false;
    jobIDErr: boolean = false;
    usageData = {
        "jobID": "",
        "selectedConsignment": "",
        "selection": ""
    }
    err: string;
    myInputEnable: boolean = false;
    browser: any;
    userInfo: any;
    constructor(private iab: InAppBrowser, private barcodeScanner: BarcodeScanner, public navCtrl: NavController, public navParams: NavParams, public _consignmentProvider: ConsignmentProvider) {
    }

    ionViewWillEnter() {
        this.usageData.jobID = '';
        this.userInfo = JSON.parse(localStorage.getItem('userDetails'))[0];
        if (this.userInfo['JobIDForce']) {
            //           this.usageData['jobID'] = " ";
        }
        setTimeout(() => {
            this.myInput.setFocus();
        }, 500);
    }
    ngOnInit() {
        this.usageData.selectedConsignment = this.navParams.get('selectedConsignment');
        this.usageData.selection = this.navParams.get('selection');
        this.checkLoginBy();
    }
    onClickImage(url) {
        this.browser = this.iab.create(url, '_blank', 'hardwareback=yes ,location=yes');
    }
    checkLoginBy() {
        if (this._consignmentProvider.checkLoginBy() == constantLoginBy.manual) {
            this.isManualLogin = true;
        } else {
            this.isManualLogin = false;
        }
    }
    buttonClick() {
        if (this.usageData['jobID'] && this.usageData['jobID'].length) {
            this.myInputEnable = true;
            this.jobIDErr = false;
            this.navCtrl.push(ProductViewPage, {'selectedConsignment': this.usageData.selectedConsignment, 'jobID': this.usageData.jobID, 'selection': this.usageData.selection}, {animate: false});
        } else {
            this.jobIDErr = true;
            this.myInputEnable = false;
        }
    }
    redirect(keyCode) {
        if (typeof keyCode == 'number' && keyCode == 13) {
            if (this.usageData['jobID'] && this.usageData['jobID'].length) {
                this.myInputEnable = true;
                this.jobIDErr = false;
                this.navCtrl.push(ProductViewPage, {'selectedConsignment': this.usageData.selectedConsignment, 'jobID': this.usageData.jobID, 'selection': this.usageData.selection}, {animate: false});
            } else {
                this.jobIDErr = true;
                this.myInputEnable = false;
            }
        }
    }
    openBarCode() {
        this.jobIDErr = false;
        this.usageData['jobID'] = null;
        this.barcodeScanner.scan().then((barcodeData: any) => {
            this.usageData['jobID'] = barcodeData.text;
            this.myInputEnable = true;
            if (this.usageData['jobID'] && this.usageData['jobID'].length) {
                this.navCtrl.push(ProductViewPage, {'selectedConsignment': this.usageData.selectedConsignment, 'jobID': this.usageData.jobID, 'selection': this.usageData.selection}, {animate: false});
            } else {
                this.jobIDErr = true;
            }
        }, (err) => {
            this.err = err;
        });
    }
}
