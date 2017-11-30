import {Injectable} from '@angular/core';
import {SqlLiteProvider} from '../sql-lite/sql-lite';
import {SQLiteObject} from '@ionic-native/sqlite';
@Injectable()
export class ProductProvider {
    DB: SQLiteObject;
    constructor(private _sqlProvider: SqlLiteProvider) {
        console.log('Hello ProductProvider Provider');
    }
    openDB() {
        return new Promise((resolve, reject) => {
            this._sqlProvider.openDb().then((db: SQLiteObject) => {
                this.DB = db;
                resolve(this.DB);
            })
        })
    }
    queryToProduct_Control_Line(selectedConsignment) {
        return new Promise((resolve, reject) => {
            this.openDB().then(() => {
                this.DB.executeSql(`SELECT * FROM Product_Control_Line WHERE ${this.cheakWhichIDHaveData(selectedConsignment)['name']}=${this.cheakWhichIDHaveData(selectedConsignment)['value']}`, []).then((res) => {
                    console.log(res)
                    if (res.rows.length) {
                        for (let i = 0; i < res.rows.length; i++) {
                            resolve(this.getProductDetails(res.rows.item(i)));
                        }
                    }
                }).catch(e => console.log(e));
            })
        })
    }
    cheakWhichIDHaveData(data) {
        let idForConditionCheck = {}
        if (data.IDWeb != -1) {
            idForConditionCheck['name'] = "ListIDWeb";
            idForConditionCheck['value'] = data.IDWeb;
            return idForConditionCheck;
        } else {
            idForConditionCheck['name'] = "ListIDLocal";
            idForConditionCheck['value'] = data.IDLocal;
            return idForConditionCheck;
        }
    }
    getProductDetails(data) {
        return new Promise((resolve, reject) => {
            this.openDB().then(() => {
                this.DB.executeSql(`SELECT * FROM Product WHERE ID=${data['ProductIDLocal']}`, []).then((res) => {
                    console.log("Product", res)
                    //                    resolve(this.getProductDetails(res));
                }).catch(e => console.log(e));
            })
        })
    }
}
