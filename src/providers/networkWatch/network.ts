import {Injectable} from '@angular/core';

@Injectable()
export class NetworkProvider {
    network = true;
    constructor() {}
    get() {
        return this.network;
    }
    set(net) {
        this.network = net;
    }
}