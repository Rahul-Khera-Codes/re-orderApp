import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import 'rxjs/Rx';
import {Observable} from 'rxjs/Observable';
@Injectable()
export class ApiServiceProvider {
    constructor(public http: HttpClient) {
    }
    apiCall(path): Observable<any> {
        let completePath = `assets/jsonData/${path}`;
        return this.http.get(completePath).map((res: Response) => {
            return res;
        }).catch((error: any) => {
            return Observable.throw(error || 'Server error')
        });
    }
}