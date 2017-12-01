import {Injectable} from '@angular/core';
import {SqlLiteProvider} from '../sql-lite/sql-lite';
import {SQLiteObject} from '@ionic-native/sqlite';
import {idType} from './../config/config';

@Injectable()
export class ProductProvider {
    DB: SQLiteObject;
    constructor(private _sqlProvider: SqlLiteProvider) {}
    openDB() {
        return new Promise((resolve, reject) => {
            this._sqlProvider.openDb().then((db: SQLiteObject) => {
                this.DB = db;
                resolve(this.DB);
            })
        })
    }
    queryToProductControlLine(selectedConsignment) {
        return new Promise((resolve, reject) => {
            let productControlLineData = [];
            this.openDB().then(() => {
                this.DB.executeSql(`SELECT * FROM Product_Control_Line WHERE ${this.cheakWhichIDHaveData(selectedConsignment)['name']}=${this.cheakWhichIDHaveData(selectedConsignment)['value']}`, []).then((res) => {
                    if (res.rows.length) {
                        for (let i = 0; i < res.rows.length; i++) {
                            productControlLineData.push((res.rows.item(i)));
                        }
                    }
                    resolve(productControlLineData);
                }).catch(e => console.log(e));
            })
        })
    }
    cheakWhichIDHaveData(selectedConsignmentData) {
        let idForConditionCheck = {}
        if (selectedConsignmentData.IDWeb != -1) {
            idForConditionCheck['name'] = idType['listWeb'];
            idForConditionCheck['value'] = selectedConsignmentData.IDWeb;
            return idForConditionCheck;
        } else {
            idForConditionCheck['name'] = idType['listLocal'];
            idForConditionCheck['value'] = selectedConsignmentData.IDLocal;
            return idForConditionCheck;
        }
    }
    getProductDetailsByQueryProduct(productControlLineData) {
        return new Promise((resolve, reject) => {
            this.openDB().then(() => {
                this.DB.executeSql(`SELECT * FROM Product WHERE ID=${productControlLineData['ProductIDLocal']}`, []).then((res) => {
                    console.log("Product", res)
                    //                    resolve(this.getProductDetails(res));
                }).catch(e => console.log(e));
            })
        })
    }
}
