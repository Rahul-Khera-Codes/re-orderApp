import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {SqlLiteProvider} from './../../providers/sql-lite/sql-lite';
@Component({
    selector: 'page-progress-details',
    templateUrl: 'progress-details.html',
})
export class ProgressDetailsPage {
    reference: any;
    referenceDetails: any;
    progress: any = {};
    flag = false;
    base: number;
    count: number = 0;
    details: any;
    constructor(private _sqlLiteProvider: SqlLiteProvider, public navCtrl: NavController, public navParams: NavParams) {
        this.base = 0;
        let base = 0;
        this.reference = this._sqlLiteProvider.progressDataEvent.subscribe((progressData) => {
            this.progress = progressData;
            if (this.progress && this.progress['error']) {
                setTimeout(() => {
                    this.navCtrl.pop();
                }, 3000)
            }
            this.count++;
            if (!this.flag) {
                base = 100 / this.progress['NoOfTotalTables'];
                this.flag = true;
                this.base += base;
            } else {
                this.base += base;
            }
            if ((this.progress['NoOfTotalTables'] - 1) == this.count) {
                this.navCtrl.pop();
            }
        })
        this.setCurrentTableProcessDetails();
    }

    setCurrentTableProcessDetails() {
        this.referenceDetails = this._sqlLiteProvider.tablesEvent.subscribe((details) => {
            this.details = details;
        })
    }

    ngOnDestroy() {
        this.reference.unsubscribe();
        this.referenceDetails.unsubscribe();
    }
}
