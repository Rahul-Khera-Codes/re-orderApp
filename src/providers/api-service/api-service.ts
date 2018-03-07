import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import 'rxjs/Rx';
import {Observable} from 'rxjs/Observable';
@Injectable()
export class ApiServiceProvider {
    constructor(public http: HttpClient) {
    }
    apiCall(path): Observable<any> {
        return this.http.get(path).map((res: Response) => {
            return res;
        }).catch((error: any) => {
            return Observable.throw(error || 'Server error')
        });
    }
    apiCallByPost(path, data): Observable<any> {
        return this.http.post(path, data).map((res: Response) => {
            return res;
        }).catch((error: any) => {
            return Observable.throw(error || 'Server error')
        });
    }
    apiCallByPut(path, data): Observable<any> {
        return this.http.put(path, data).map((res: Response) => {
            return res;
        }).catch((error: any) => {
            return Observable.throw(error || 'Server error')
        });
    }
}