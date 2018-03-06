import {Injectable, Output, EventEmitter} from '@angular/core';

@Injectable()
export class IsLoginEventHandlerProvider {
    @Output()
    isLogin = new EventEmitter();
    constructor() {}
    eventGenraterForLogin() {
        this.isLogin.emit('true');
    }
}
