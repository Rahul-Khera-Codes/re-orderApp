import {Injectable} from '@angular/core';
import {SqlLiteProvider} from '../sql-lite/sql-lite';
import {SQLiteObject} from '@ionic-native/sqlite';
import {constantidType} from './../config/config';
import forEach from 'lodash/forEach'
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
                this.DB.executeSql(`SELECT * FROM Product_Control_Line WHERE ${this.checkWhichIDHaveData(selectedConsignmentIDWeb, selectedConsignmentIDLocal)['name']} = ${this.checkWhichIDHaveData(selectedConsignmentIDWeb, selectedConsignmentIDLocal)['value'] * 1}`, []).then((res) => {
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
    queryToUsage(usageData) {
        return new Promise((resolve, reject) => {
            this.DB.executeSql(`insert into Usage VALUES (?,?,?,?,?,?,?,?)`, [usageData.IDLocal, usageData.listIDLocal, usageData.customerIDLocal, usageData.contactIDLocal, usageData.currentData, usageData.jobID, usageData.latitude, usageData.longitude]).then((res) => {
                resolve(res);
            }).catch(e => console.log(e))
        })
    }
    queryToUsageLine(UsageLineDataArray) {
        return new Promise((resolve, reject) => {
            forEach(UsageLineDataArray, (value, key) => {
                this.DB.executeSql(`insert into Usage_Line VALUES (?,?,?,?,?)`, [value.IDLocal, value.usageIDLocal, value.productID, value.qty, value.createdDateTime]).then((res) => {
                    resolve(res);
                }).catch(e => {
                    console.log(e);
                    reject(e);
                })
            })
        })
    }
    getProductDetailsByQueryProduct(productControlLineData) {
        return new Promise((resolve, reject) => {
            let productDetails = [];
            let productControlLineDataLoopOver = false;
            for (let i = 0; i < productControlLineData.length; i++) {
                this.DB.executeSql(`SELECT * FROM Product WHERE ID=${productControlLineData[i]['ProductIDLocal']}`, []).then((res) => {
                    if (res.rows.length) {
                        productDetails.push(res.rows.item(0));
                    }
                    if (i == productControlLineData.length - 1) {
                        productControlLineDataLoopOver = true;
                    } else {
                        productControlLineDataLoopOver = false;
                    }
                }).catch(e => console.log(e)).then(() => {
                    if (productControlLineDataLoopOver) {
                        resolve(productDetails);
                    }
                })
            }
        });
    }
}
