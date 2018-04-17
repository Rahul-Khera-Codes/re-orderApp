import {Injectable, Output, EventEmitter} from '@angular/core';

@Injectable()
export class EventProvider {
    @Output()
    mode = new EventEmitter();
    scan = new EventEmitter();
    brower = new EventEmitter();
    constructor() {}
    setEvent() {
        this.mode.emit("true");
    }
    setScanEvent() {
        this.scan.emit("true");
    }
    setBrowserEvent() {
        this.brower.emit("true");
    }
}

