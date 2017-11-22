import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import 'rxjs/Rx';
import {Observable} from 'rxjs/Observable';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite';
import forEach from 'lodash/forEach';
@Injectable()
export class ApiServiceProvider {
    db: SQLiteObject;
    constructor(public http: HttpClient, private sqlite: SQLite) {
    }
    apiCall(path): Observable<any> {
        let completePath = `assets/jsonData/demo.json`;
        return this.http.get(completePath).map((res: any) => {
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
                            this.db.executeSql('select * from CANDIDATE_DEVICE', {}).then((data) => console.log('Executed SQL get', data))
                                .catch(e => console.log(e));
                        }, 500)

                    }
                })
            }
            return res;
        })
            //...errors if any
            .catch((error: any) => {
                return Observable.throw(error || 'Server error')
            });

    }
}