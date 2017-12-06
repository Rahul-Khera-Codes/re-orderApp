import {Component, ViewChild} from '@angular/core';
import {MenuController} from 'ionic-angular';
import {MyApp} from './../../app/app.component';
import {SQLitePorter} from '@ionic-native/sqlite-porter';
import {SqlLiteProvider} from './../../providers/sql-lite/sql-lite';
import {SQLiteObject} from '@ionic-native/sqlite';

@Component({
    selector: 'side-menu',
    templateUrl: 'side-menu.html'
})
export class SideMenuComponent {
    @ViewChild(MyApp) index: MyApp;
    constructor(private _sqlService: SqlLiteProvider, private sqlitePorter: SQLitePorter, private _menuCtrl: MenuController) {}
    ngOnInit() {
        this._menuCtrl.enable(true);
    }
    importData() {
        this.index.importData();
    }
    exportData() {
        this._sqlService.openDb().then((db:SQLiteObject) => {
            this.sqlitePorter.exportDbToJson(db)
                .then((res) => console.log('Imported',res))
                .catch(e => console.error(e));
        })
    }

}
