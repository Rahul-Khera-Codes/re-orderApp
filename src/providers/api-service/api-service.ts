import {HttpClient} from '@angular/common/http';
import {Injectable, Output, EventEmitter} from '@angular/core';
import 'rxjs/Rx';
import {Observable} from 'rxjs/Observable';
import { share } from 'rxjs/operators';

@Injectable()
export class ApiServiceProvider {
    @Output()
    apiInProcess = new EventEmitter();
    constructor(public http: HttpClient) {
    }
    checkProgress(process: boolean) {
        this.apiInProcess.emit(process);
    }
    apiCall(path): Observable<any> {
        return this.http.get(path).map((res: Response) => {
            return res;
        }).pipe(share()).catch((error: any) => {
            return Observable.throw(error || 'Server error')
        });
    }
    apiCallByPost(path, data): Observable<any> {
        return this.http.post(path, data).map((res: Response) => {
            localStorage.removeItem("fail");
            this.checkProgress(false);
            return res;
        }).catch((error: any) => {
            localStorage.setItem("fail", 'true');
            this.checkProgress(true);
            return Observable.throw(error || 'Server error');
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