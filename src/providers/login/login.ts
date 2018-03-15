import {Injectable} from '@angular/core';
import {SQLiteObject} from '@ionic-native/sqlite';
import {SqlLiteProvider} from '../sql-lite/sql-lite';
import {LocalStorageProvider} from './../local-storage/local-storage';
declare let md5: any;
@Injectable()
export class LoginProvider {
    DataBase: SQLiteObject;
    constructor(private _localStorageProvider: LocalStorageProvider, private _sqlProvider: SqlLiteProvider) {}
    convertLoginResTojson(res) {
        let userData = [];
        for (let i = 0; i < res.rows.length; i++) {
            userData.push(res.rows.item(i))
        }
        this._localStorageProvider.setLocalStorageData('userDetails', userData)
    }
    encryptPassword(pass) {
        let hash = md5(pass);
        return hash;
    }
    checkLoginBy() {
        return this._localStorageProvider.getLocalStorageData('LoginBy')
    }
    getCurentTimeDate() {
        let today = new Date();
        return (today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds());
    }
    checkWhichTableEmailExits(email) {
        return new Promise((resolve, reject) => {
            console.log("email",email)
            this.DataBase.executeSql(`SELECT * FROM Customer_Table WHERE EmailAddress='${email}'`, []).then((res) => {
                if (res.rows.length) {
                    resolve('Customer_Table');
                }
                else {
                    this.DataBase.executeSql(`SELECT * FROM Contact_Table WHERE EmailAddress='${email}'`, []).then((res) => {
                        if (res.rows.length) {
                            resolve('Contact_Table')
                        } else {
                            reject('Wrong email');
                        }
                    })
                }
            })
        })
    }
    updatePasswordWhenForgot(pass, email) {
        return new Promise((resolve, reject) => {
            this._sqlProvider.openDb().then((db: SQLiteObject) => {
                this.DataBase = db;
                console.log("db",db);
                this.checkWhichTableEmailExits(email).then((tableName) => {
                    this.DataBase.executeSql(`UPDATE ${tableName} SET Password='${pass}' , LastUpdatedDateTime='${this.getCurentTimeDate()}' WHERE EmailAddress = '${email}'`, []).then((res) => {
                        resolve(pass);
                    }).catch(e => {
                        reject(e);
                    });
                }, (err) => {
                    reject(err)
                })
            })
        })
    }
    updatePassword(tableName, pwd, email, newPwd) {
        return new Promise((resolve, reject) => {
            this._sqlProvider.openDb().then((db: SQLiteObject) => {
                this.DataBase = db;
                this.DataBase.executeSql(`UPDATE ${tableName} SET Password='${this.encryptPassword(newPwd)}' , LastUpdatedDateTime='${this.getCurentTimeDate()}' WHERE EmailAddress='${email}' AND Password='${this.encryptPassword(pwd)}'`, []).then((res) => {
                    if (res.rowsAffected) {
                        resolve(newPwd);
                    } else {
                        reject("Wrong Password");
                    }

                }).catch(e => {
                    reject(e);
                });
            }, (err) => {
                reject(err)
            })
        })
    }
    authUserCustomer(formDataEmail, formDataEmailPassword) {
        return new Promise((resolve, reject) => {
            this._sqlProvider.openDb().then((db: SQLiteObject) => {
                this.DataBase = db;
                this.DataBase.executeSql(`SELECT * FROM Customer_Table WHERE EmailAddress='${formDataEmail}' AND Password='${formDataEmailPassword}'`, []).then((res) => {
                    if (res.rows.length) {
                        this.convertLoginResTojson(res);
                        this._localStorageProvider.setLocalStorageData('userType', "customer");
                        this._localStorageProvider.setLocalStorageData('LoginBy', "manual");
                        let data = {};
                        data['tableName'] = "Customer_Table";
                        data['IDWeb'] = res.rows.item(0).IDWeb;
                        data['IDLocal'] = res.rows.item(0).IDLocal;
                        data['barCode'] = false;
//                        this._sqlProvider.checkApiType("xyz", data).then(() => {
//                            resolve(res);
//                        }, (err) => {
                            this._sqlProvider.checkDataExistInTable("Product_Control_List").then((tableLength) => {
                                if (tableLength) {
//                                    res['err'] = "synchronization failed";
                                    resolve(res);
                                } else {
//                                    reject("synchronization failed");
                                }
                            })
//                        })
                    } else {
                        resolve(this.authUserContact(formDataEmail, formDataEmailPassword));
                    }
                }).catch(e => reject(e));
            })
        })
    }
    authUserContact(formDataEmail, formDataEmailPassword) {
        return new Promise((resolve, reject) => {
            this.DataBase.executeSql(`SELECT * FROM Contact_Table WHERE EmailAddress='${formDataEmail}' AND Password='${formDataEmailPassword}'`, []).then((res) => {
                if (res.rows.length) {
                    this.convertLoginResTojson(res)
                    this._localStorageProvider.setLocalStorageData('userType', "contact");
                    this._localStorageProvider.setLocalStorageData('LoginBy', "manual");
                    let data = {};
                    data['tableName'] = "Contact_Table";
                    data['IDWeb'] = res.rows.item(0).IDWeb;
                    data['IDLocal'] = res.rows.item(0).IDLocal;
                    data['barCode'] = false;
//                    this._sqlProvider.checkApiType("xyz", data).then(() => {
//                        resolve(res);
//                    }, (err) => {
//                        this._sqlProvider.checkDataExistInTable("Product_Control_List").then((tableLength) => {
//                            if (tableLength) {
//                                res['err'] = "synchronization failed";
                                resolve(res);
//                            } else {
//                                reject("synchronization failed");
//                            }
//                        })
//                    })
                } else {
                    reject("user not exist");
//                    this.checkDataExistInTable();
                }
            }).catch(e => reject(e));
        })
    }
    
    getLoginRecord(){
        return new Promise((resolve, reject) => {
            
        })
    }
    
//    checkDataExistInTable() {
//        this.DataBase.executeSql(`SELECT * FROM Customer_Table`, []).then((res) => {
//            console.log("res", res)
//        })
//
//    }
    authUserCustomerByBarCode(barCode) {
        return new Promise((resolve, reject) => {
            this._sqlProvider.openDb().then((db: SQLiteObject) => {
                this.DataBase = db;
                this.DataBase.executeSql(`SELECT * FROM Customer_Table WHERE LoginBarcode='${barCode}'`, []).then((res) => {
                    if (res.rows.length) {
                        this.convertLoginResTojson(res);
                        this._localStorageProvider.setLocalStorageData('userType', "customer");
                        this._localStorageProvider.setLocalStorageData('LoginBy', "barCode");
                        let data = {};
                        data['tableName'] = "Customer_Table";
                        data['IDWeb'] = res.rows.item(0).IDWeb;
                        data['IDLocal'] = res.rows.item(0).IDLocal;
                        data['barCode'] = true;
//                        this._sqlProvider.checkApiType("xyz", data).then(() => {
//                            resolve(res);
//                        }, (err) => {
//                            this._sqlProvider.checkDataExistInTable("Product Control List").then((tableLength) => {
//                                if (tableLength) {
//                                    res['err'] = "synchronization failed";
                                    resolve(res);
//                                } else {
//                                    reject("synchronization failed");
//                                }
//                            })
//                        })
                    } else {
                        resolve(this.authUserContactByBarCode(barCode));
                    }
                }).catch(e => reject(""));
            })
        })
    }
    authUserContactByBarCode(barCode) {
        return new Promise((resolve, reject) => {
            this.DataBase.executeSql(`SELECT * FROM Contact_Table WHERE LoginBarcode='${barCode}'`, []).then((res) => {
                if (res.rows.length) {
                    this.convertLoginResTojson(res);
                    this._localStorageProvider.setLocalStorageData('userType', "contact");
                    this._localStorageProvider.setLocalStorageData('LoginBy', "barCode");
                    let data = {};
                    data['tableName'] = "Contact_Table";
                    data['IDWeb'] = res.rows.item(0).IDWeb;
                    data['IDLocal'] = res.rows.item(0).IDLocal;
                    data['barCode'] = true;
//                    this._sqlProvider.checkApiType("xyz", data).then(() => {
//                        resolve(res);
//                    }, (err) => {
//                        this._sqlProvider.checkDataExistInTable("Product Control List").then((tableLength) => {
//                            if (tableLength) {
//                                res['err'] = "synchronization failed";
                                resolve(res);
//                            } else {
//                                reject("synchronization failed");
//                            }
//                        })
//                    })
                } else {
                    reject("user not exist");
                }
            }).catch(e => reject(""));
        })
    }
}
