import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite';
import {ApiServiceProvider} from '../api-service/api-service';
import forEach from 'lodash/forEach';
@Injectable()
export class SqlLiteProvider {
    db: SQLiteObject;

    constructor(private _apiProvider: ApiServiceProvider, public http: HttpClient, private sqlite: SQLite) {
        console.log('Hello SqlLiteProvider Provider');
    }
    createSqlLiteConnectionWithTables() {
        return new Promise((resolve, reject) => {
            this._apiProvider.apiCall("demo.json").subscribe(res => {
                if (res && res.length) {
                    forEach(res, (value) => {
                        if (value.type == "database") {
                            let createData: any = {};
                            createData['name'] = value.name;
                            createData['location'] = 'default';
                            this.sqlite.create(createData)
                                .then((db: SQLiteObject) => {
                                    this.db = db;
                                })
                                .catch(e => console.log(e));
                        } else if (value.type == "table") {
                            setTimeout(() => {
                                let structure: string = "";
                                forEach(value.structure, (key, value) => {
                                    structure = structure + value + " " + key + ",";
                                })

                                structure = structure.slice(0, -1);
                                this.db.executeSql(`create table ${value.name}(${structure})`, {}).then(() => console.log('Executed SQL create'))
                                    .catch(e => console.log(e));
                                forEach(value.data, (valueTable, key) => {
                                    let insertData: string = "";
                                    forEach(valueTable, (record, key) => {
                                        insertData = insertData + "'" + record + "'" + "" + ","
                                    })
                                    insertData = insertData.slice(0, -1);
                                    this.db.executeSql(`insert into ${value.name} VALUES (${insertData})`, []).then(() => console.log('Executed SQL insert'))
                                        .catch(e => console.log(e));
                                })
//                                this.db.executeSql('select * from Customer_Table', {}).then((data) => console.log('Executed SQL get', data))
//                                    .catch(e => console.log(e));
                            }, 500)

                        }
                    })
                }
                resolve(true);
            })

        })
    }
}
