import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import 'rxjs/Rx';
import {Observable} from 'rxjs/Observable';
@Injectable()
export class ApiServiceProvider {
    constructor(public http: HttpClient) {
    }
    apiCall(path): Observable<any> {
        alert("get call")
        return this.http.get(path).map((res: Response) => {
            alert("get call res "+'${res}')
            return res;
        }).catch((error: any) => {
            return Observable.throw(error || 'Server error')
        });
    }
    apiCallByPost(path, data): Observable<any> {
        alert("get post")
        return this.http.post(path, data).map((res: Response) => {
            alert("get post res"+'${res}')
            return res;
        }).catch((error: any) => {
            return Observable.throw(error || 'Server error')
        });
    }
    apiCallByPut(path, data): Observable<any> {
        alert("get put")
        return this.http.put(path, data).map((res: Response) => {
            alert("get put res"+'${res}')
            return res;
        }).catch((error: any) => {
            return Observable.throw(error || 'Server error')
        });
    }
}