import {Injectable} from '@angular/core';
import {SqlLiteProvider} from '../sql-lite/sql-lite';
import {SQLiteObject} from '@ionic-native/sqlite';
import {constantidType, constantLoginBy} from './../config/config';
import {LocalStorageProvider} from './../local-storage/local-storage';
@Injectable()
export class ConsignmentProvider {
    userData: any;
    DB: SQLiteObject;
    consignmentList = [];
    constructor(private _localStorageProvider: LocalStorageProvider, private _sqlProvider: SqlLiteProvider) {}
    checkLoginBy() {
        return this._localStorageProvider.getLocalStorageData('LoginBy')
    }
    getUserData() {
        if (this.userData) {
            return this.userData;
        } else {
            return this.userData = JSON.parse(this._localStorageProvider.getLocalStorageData('userDetails'));
        }
    }
    removeUserData() {
        this.userData = null;
        this._localStorageProvider.removeLocalStorageData('userDetails');
        this._localStorageProvider.removeLocalStorageData('userType');
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
                resolve(this._localStorageProvider.getLocalStorageData('userType'));
            })
        })
    }
    checkIdIfNegative(userdataIDWeb, userdataIDLocal) {
        let idForConditionCheck = {};
        if (userdataIDWeb != -1) {
            idForConditionCheck['name'] = constantidType['idWeb'];
            idForConditionCheck['value'] = userdataIDWeb;
            return idForConditionCheck;
        } else {
            idForConditionCheck['name'] = constantidType['idLocal'];
            idForConditionCheck['value'] = userdataIDLocal;
            return idForConditionCheck;
        }
    }

    createList(reponseData) {
        let data = [];
        for (let i = 0; i < reponseData.rows.length; i++) {
            if (reponseData.rows.item(i)) {
                data.push(reponseData.rows.item(i));
            }
            if ((reponseData.rows.length - 1) == i) {
                return data;
            }
        }
    }
    queryToProductControlList() {
        this.consignmentList = [];
        return new Promise((resolve, reject) => {
            let userdata = this.getUserData();
            let IDToBeCheck = null;
            if (this.checkIdIfNegative(userdata[0].IDWeb, userdata[0].IDLocal)['name'] == "IDWeb") {
                IDToBeCheck = constantidType['customerIDWeb'];
            } else {
                IDToBeCheck = constantidType['customerIDLocal'];
            }
            if (this.checkLoginBy() == constantLoginBy.manual) {
                this.DB.executeSql(`SELECT * FROM Product_Control_List WHERE ${IDToBeCheck}=${this.checkIdIfNegative(userdata[0].IDWeb, userdata[0].IDLocal)['value']}`, []).then((res) => {
                    if (res && res.rows.length) {
                        this.consignmentList = this.createList(res);
                    }
                }).catch(e => console.log(e)).then(() => {
                    resolve({list: this.consignmentList});
                });
            } else {
                this.DB.executeSql(`SELECT * FROM Product_Control_List WHERE ${IDToBeCheck}=${this.checkIdIfNegative(userdata[0].IDWeb, userdata[0].IDLocal)['value']} AND IsDefault="true"`, []).then((res) => {
                    if (res && res.rows.length) {
                        this.consignmentList = this.createList(res);
                    }
                }).catch(e => console.log(e)).then(() => {
                    resolve({list: this.consignmentList});
                });
            }
        })
    }

    queryListToContact() {
        let listToContact = [];
        return new Promise((resolve, reject) => {
            let userdata = this.getUserData();
            let IDToBeCheck = null;
            if (this.checkIdIfNegative(userdata[0].IDWeb, userdata[0].IDLocal)['name'] == "IDWeb") {
                IDToBeCheck = constantidType['contactIDWeb'];
            } else {
                IDToBeCheck = constantidType['contactIDLocal'];
            }
            if (this.checkLoginBy() == constantLoginBy.manual) {
                this.DB.executeSql(`SELECT * FROM List_to_Contact WHERE ${IDToBeCheck}=${this.checkIdIfNegative(userdata[0].IDWeb, userdata[0].IDLocal)['value']}`, []).then((res) => {
                    if (res.rows.length) {
                        listToContact = this.createList(res);
                    }
                    resolve(listToContact);
                }).catch(e => console.log(e));
            } else {
                this.DB.executeSql(`SELECT * FROM List_to_Contact WHERE ${IDToBeCheck}=${this.checkIdIfNegative(userdata[0].IDWeb, userdata[0].IDLocal)['value']} AND IsDefault="true"`, []).then((res) => {
                    if (res.rows.length) {
                        listToContact = this.createList(res);
                    }
                    resolve(listToContact);
                }).catch(e => console.log(e));
            }
        })
    }
    IDCheckListToContact(listToContactIDWeb, listToContactIDLocal) {
        let idForConditionCheck = {};
        if (listToContactIDWeb != -1) {
            idForConditionCheck['name'] = constantidType['idWeb'];
            idForConditionCheck['value'] = listToContactIDWeb;
        } else {
            idForConditionCheck['name'] = constantidType['idLocal'];
            idForConditionCheck['value'] = listToContactIDLocal;
        }
        return idForConditionCheck;
    }
    queryProductControlListContentLogin(listToContact) {
        return new Promise((resolve, reject) => {
            let j;
            let Product_Control_ListComplete = false;
            for (let i = 0; i < listToContact.length; i++) {
                this.DB.executeSql(`SELECT * FROM Product_Control_List WHERE ${this.IDCheckListToContact(listToContact[i].ListIDWeb, listToContact[i].ListIDLocal)['name']}=${this.IDCheckListToContact(listToContact[i].ListIDWeb, listToContact[i].ListIDLocal)['value']}`, []).then((res) => {
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
