import {Injectable} from '@angular/core';
import {SqlLiteProvider} from '../sql-lite/sql-lite';
import {SQLiteObject} from '@ionic-native/sqlite';
import {idType} from './../config/config';
@Injectable()
export class ConsignmentProvider {
    userData: any;
    DB: SQLiteObject;
    consignmentList = [];
    constructor(private _sqlProvider: SqlLiteProvider) {}
    getUserData() {
        if (this.userData) {
            return this.userData;
        } else {
            return this.userData = JSON.parse(localStorage.getItem('userDetails'));
        }
    }
    removeUserData() {
        this.userData = null;
        localStorage.removeItem('userDetails');
        localStorage.removeItem('userType');
    }
    openDB() {
        return new Promise((resolve, reject) => {
            this._sqlProvider.openDb().then((db: SQLiteObject) => {
                this.DB = db;
                resolve(this.DB);
            })
        })
    }
    checkUserType() {
        return new Promise((resolve, reject) => {
            this.openDB().then(() => {
                resolve(localStorage.getItem('userType'))
            })
        })
    }
    checkIdIfNegative(userdata) {
        if (userdata && userdata.length) {
            let idForConditionCheck = {}
            if (userdata[0].IDWeb != -1) {
                idForConditionCheck['name'] = idType['idWeb'];
                idForConditionCheck['value'] = userdata[0].IDWeb;
                return idForConditionCheck;
            } else {
                idForConditionCheck['name'] = idType['idLocal'];
                idForConditionCheck['value'] = userdata[0].IDLocal;
                return idForConditionCheck;
            }
        }
    }
    queryToProductControlList() {
        return new Promise((resolve, reject) => {
            let userdata = this.getUserData();
            let IDToBeCheck = null;
            if (this.checkIdIfNegative(userdata)['name'] == "IDWeb") {
                IDToBeCheck = idType['customerIDWeb'];
            } else {
                IDToBeCheck = idType['customerIDLocal'];
            }
            this.DB.executeSql(`SELECT * FROM Product_Control_List WHERE ${IDToBeCheck}=${this.checkIdIfNegative(userdata)['value']}`, []).then((res) => {
                if (res && res.rows.length) {
                    for (let i = 0; i < res.rows.length; i++) {
                        if (res.rows.item(i)) {
                            this.consignmentList.push(res.rows.item(i));
                        }
                    }
                    resolve({list: this.consignmentList});
                }
            }).catch(e => console.log(e));
        })
    }

    queryListToContact() {
        let listToContact = [];
        return new Promise((resolve, reject) => {
            let userdata = this.getUserData();
            let IDToBeCheck = null;
            if (this.checkIdIfNegative(userdata)['name'] == "IDWeb") {
                IDToBeCheck = idType['contactIDWeb'];
            } else {
                IDToBeCheck = idType['contactIDLocal'];
            }
            this.DB.executeSql(`SELECT * FROM List_to_Contact WHERE ${IDToBeCheck}=${this.checkIdIfNegative(userdata)['value']}`, []).then((res) => {
                for (let i = 0; i < res.rows.length; i++) {
                    listToContact.push(res.rows.item(i));
                }
                resolve(listToContact);
            }).catch(e => console.log(e));
        })
    }
    IDCheckListToContact(listToContact) {
        let idForConditionCheck = {};
        if (listToContact.IDWeb != -1) {
            idForConditionCheck['name'] = idType['idWeb'];
            idForConditionCheck['value'] = listToContact.IDWeb;
        } else {
            idForConditionCheck['name'] = idType['idLocal'];
            idForConditionCheck['value'] = listToContact.IDLocal;
        }
        return idForConditionCheck;
    }
    queryProductControlListContentLogin(listToContact) {
        return new Promise((resolve, reject) => {
            let j;
            let Product_Control_ListComplete = false;
            for (let i = 0; i < listToContact.length; i++) {
                this.DB.executeSql(`SELECT * FROM Product_Control_List WHERE ${this.IDCheckListToContact(listToContact[i])['name']}=${this.IDCheckListToContact(listToContact[i])['value']}`, []).then((res) => {
                    if (res && res.rows.length) {
                        for (j = 0; j < res.rows.length; j++) {
                            if (res.rows.item(j)) {
                                this.consignmentList.push(res.rows.item(j));
                            }
                            if (j == res.rows.length - 1) {
                                Product_Control_ListComplete = true;
                            } else {
                                Product_Control_ListComplete = false;
                            }
                        }
                    }
                }).catch(e => console.log(e)).then(() => {
                    if (i == (listToContact.length - 1) && Product_Control_ListComplete) {
                        resolve({list: this.consignmentList});
                    }
                })

            }
        })
    }

}
