import {Injectable} from '@angular/core';
import {SQLiteObject} from '@ionic-native/sqlite';
import {SqlLiteProvider} from '../sql-lite/sql-lite';
@Injectable()
export class LoginProvider {
    DataBase: SQLiteObject;
    constructor(private _sqlProvider: SqlLiteProvider) {}
    convertLoginResTojson(res) {
        let userData = [];
        for (let i = 0; i < res.rows.length; i++) {
            userData.push(res.rows.item(i))
        }
        localStorage.setItem('userDetails', JSON.stringify(userData));
    }
    authUserCustomer(formData) {
        return new Promise((resolve, reject) => {
            this._sqlProvider.openDb().then((db: SQLiteObject) => {
                this.DataBase = db;
                this.DataBase.executeSql(`SELECT * FROM Customer_Table WHERE EmailAddress='${formData.email}' AND Password='${formData.password}'`, []).then((res) => {
                    if (res.rows.length) {
                        this.convertLoginResTojson(res)
                        localStorage.setItem('userType', "customer");
                        resolve(res);
                    } else {
                        resolve(this.authUserContact(formData));
                    }
                }).catch(e => reject(e));
            })
        })
    }
    authUserContact(formData) {
        return new Promise((resolve, reject) => {
            this.DataBase.executeSql(`SELECT * FROM Contact_Table WHERE EmailAddress='${formData.email}' AND Password='${formData.password}'`, []).then((res) => {
                if (res.rows.length) {
                    this.convertLoginResTojson(res)
                    localStorage.setItem('userType', "contact");
                    resolve(res);
                } else {
                    console.log("user not exist");
                }
            }).catch(e => reject(e));
        })
    }
}
