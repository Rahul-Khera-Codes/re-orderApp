import {Injectable, Output, EventEmitter} from '@angular/core';

@Injectable()
export class EventProvider {
    @Output()
    mode = new EventEmitter();
    constructor() {}
    setEvent() {
        this.mode.emit("true");
    }
}

