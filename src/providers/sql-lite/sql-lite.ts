import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite';
import {ApiServiceProvider} from '../api-service/api-service';
import forEach from 'lodash/forEach';
@Injectable()
export class SqlLiteProvider {
    db: SQLiteObject;
    constructor(private _apiProvider: ApiServiceProvider, public http: HttpClient, private sqlite: SQLite) {
    }
    createSqlLiteDB() {
        return new Promise((resolve, reject) => {
            let createData: any = {};
            createData['name'] = 'reorderDB';
            createData['location'] = 'default';
            this.sqlite.create(createData)
                .then((db: SQLiteObject) => {
                    this.db = db;
                    resolve(db);
                })
                .catch(e => reject(e));

        });
    }
    openDb() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve(this.db);
            } else {
                this.createSqlLiteDB();
            }
        });
    }
    createSqlLiteTable() {
        return new Promise((resolve, reject) => {
            this._apiProvider.apiCall("structure.json").subscribe(res => {
                forEach(res, (value) => {
                    let structure: string = "";
                    forEach(value.structure, (key, value) => {
                        structure = structure + value + " " + key + ",";
                    })
                    structure = structure.slice(0, -1);
                    this.db.executeSql(`CREATE TABLE IF NOT EXISTS ${value.name}(${structure})`, []).then(() => console.log('Executed SQL create'))
                        .catch(e => console.log(e));
                })
                resolve(true);
            })
        })
    }
    insertSqlLiteData(value, valueTable) {
        setTimeout(() => {
            let insertData: string = "";
            forEach(valueTable, (record, key) => {
                insertData = insertData + "'" + record + "'" + "" + ","
            })
            insertData = insertData.slice(0, -1);
            this.db.executeSql(`insert into ${value.name} VALUES (${insertData})`, []).then(() => console.log('Executed SQL insert'))
                .catch(e => console.log(e));
        }, 500)
    }
    updateSqlLiteData(value, valueTable) {
        let insertData: string = "";
        forEach(valueTable, (record, key) => {
            insertData = insertData + key + "=" + "'" + record + "'" + "" + ","
        })
        insertData = insertData.slice(0, -1);
        setTimeout(() => {
            this.db.executeSql(`UPDATE ${value.name} SET ${insertData} WHERE IDWeb != -1`, []).then(() => console.log('Executed SQL update'))
                .catch(e => console.log(e));
        }, 500)
    }
    checkDataExistInTable(value) {
        return new Promise((resolve, reject) => {
            this.db.executeSql(`SELECT * from ${value.name}`, []).then((data) => resolve(data.rows.length))
                .catch(e => console.log(e));
        })
    }
    manageSqlLiteData() {
        this._apiProvider.apiCall("demo.json").subscribe(res => {
            if (res && res.length) {
                forEach(res, (value) => {
                    if (value.type == "table") {
                        this.checkDataExistInTable(value).then((isExist) => {
                            if (isExist && (value.name == "Customer_Table" || value.name == "Contact_Table" || value.name == "Product_Control_List" || value.name == "Product_Control_Line" || value.name == "List_to_Contact")) {
                                forEach(value.data, (valueTable, key) => {
                                    if (valueTable && valueTable['IDWeb'] == -1) {
                                        this.insertSqlLiteData(value, valueTable);
                                    } else {
                                        this.updateSqlLiteData(value, valueTable);
                                    }
                                })
                            } else {
                                forEach(value.data, (valueTable, key) => {
                                    this.insertSqlLiteData(value, valueTable);
                                })
                            }
                        })
                    }
                })
            }
        })
    }
}
