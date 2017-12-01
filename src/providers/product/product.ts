import {Injectable} from '@angular/core';
import {SqlLiteProvider} from '../sql-lite/sql-lite';
import {SQLiteObject} from '@ionic-native/sqlite';
import {constantidType} from './../config/config';

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
    queryToProductControlLine(selectedConsignmentIDWeb, selectedConsignmentIDLocal) {
        return new Promise((resolve, reject) => {
            let productControlLineData = [];
            this.openDB().then(() => {
                this.DB.executeSql(`SELECT * FROM Product_Control_Line WHERE ${this.checkWhichIDHaveData(selectedConsignmentIDWeb, selectedConsignmentIDLocal)['name']}=${this.checkWhichIDHaveData(selectedConsignmentIDWeb, selectedConsignmentIDLocal)['value']}`, []).then((res) => {
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
    checkWhichIDHaveData(selectedConsignmentIDWeb, selectedConsignmentIDLocal) {
        let idForConditionCheck = {}
        if (selectedConsignmentIDWeb != -1) {
            idForConditionCheck['name'] = constantidType['listWeb'];
            idForConditionCheck['value'] = selectedConsignmentIDWeb;
            return idForConditionCheck;
        } else {
            idForConditionCheck['name'] = constantidType['listLocal'];
            idForConditionCheck['value'] = selectedConsignmentIDLocal;
            return idForConditionCheck;
        }
    }
    getProductDetailsByQueryProduct(ProductIDLocal) {
        return new Promise((resolve, reject) => {
            this.openDB().then(() => {
                this.DB.executeSql(`SELECT * FROM Product WHERE ID=${ProductIDLocal}`, []).then((res) => {
                    console.log("Product", res)
                    //                    resolve(this.getProductDetails(res));
                }).catch(e => console.log(e));
            })
        })
    }
}
