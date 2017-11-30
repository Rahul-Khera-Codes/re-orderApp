import {Injectable} from '@angular/core';
import {SqlLiteProvider} from '../sql-lite/sql-lite';
import {SQLiteObject} from '@ionic-native/sqlite';
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
                let userType = localStorage.getItem('userType');
                if (userType == "customer") {
                    resolve(this.queryToProduct_Control_List());
                } else {
                    resolve(this.queryListToContact());
                }
            })
        })
    }
    checkIdIfNegative(userdata) {
        if (userdata && userdata.length) {
            let idForConditionCheck = {}
            if (userdata[0].IDWeb != -1) {
                idForConditionCheck['name'] = "IDWeb";
                idForConditionCheck['value'] = userdata[0].IDWeb;
                return idForConditionCheck;
            } else {
                idForConditionCheck['name'] = "IDLocal";
                idForConditionCheck['value'] = userdata[0].IDLocal;
                return idForConditionCheck;
            }
        }
    }
    queryToProduct_Control_List() {
        return new Promise((resolve, reject) => {
            let userdata = this.getUserData();
            let IDToBeCheck = null;
            if (this.checkIdIfNegative(userdata)['name'] == "IDWeb") {
                IDToBeCheck = 'CustomerIDWeb';
            } else {
                IDToBeCheck = 'CustomerIDLocal';
            }
            this.DB.executeSql(`SELECT * FROM Product_Control_List WHERE ${IDToBeCheck}=${this.checkIdIfNegative(userdata)['value']}`, []).then((res) => {
                resolve(this.createConsigmentData(res));
            }).catch(e => console.log(e));
        })
    }

    queryListToContact() {
        return new Promise((resolve, reject) => {
            let userdata = this.getUserData();
            let IDToBeCheck = null;
            if (this.checkIdIfNegative(userdata)['name'] == "IDWeb") {
                IDToBeCheck = 'ContactIDWeb';
            } else {
                IDToBeCheck = 'ContactIDLocal';
            }
            this.DB.executeSql(`SELECT * FROM List_to_Contact WHERE ${IDToBeCheck}=${this.checkIdIfNegative(userdata)['value']}`, []).then((res) => {
                for (let i = 0; i < res.rows.length; i++) {
                    resolve(this.IDCheckListToContact(res.rows.item(i).ListIDLocal, res.rows.item(i).ListIDWeb));
                }
            }).catch(e => console.log(e));
        })
    }
    IDCheckListToContact(idLocal, idWeb) {
        return new Promise((resolve, reject) => {
            let idForConditionCheck = {};
            if (idWeb != -1) {
                idForConditionCheck['name'] = "IDWeb";
                idForConditionCheck['value'] = idWeb;
                resolve(this.queryProductControlListContentLogin(idForConditionCheck));
            } else {
                idForConditionCheck['name'] = "IDLocal";
                idForConditionCheck['value'] = idLocal;
                resolve(this.queryProductControlListContentLogin(idForConditionCheck));
            }
        });
    }
    queryProductControlListContentLogin(id) {
        return new Promise((resolve, reject) => {
            this.DB.executeSql(`SELECT * FROM Product_Control_List WHERE ${id.name}=${id['value']}`, []).then((res) => {
                resolve(this.createConsigmentData(res));
            }).catch(e => console.log(e));
        })
    }
    createConsigmentData(res) {
        return new Promise((resolve, reject) => {
            if (res && res.rows.length) {
                for (let i = 0; i < res.rows.length; i++) {
                    this.consignmentList.push(res.rows.item(i));
                }
            }
            resolve(this.consignmentList);
        })
    }
}
