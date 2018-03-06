import {Injectable} from '@angular/core';
import {Toast} from '@ionic-native/toast';
@Injectable()
export class ToastProvider {

    constructor(private toast: Toast) {
    }
    presentToast(message, duration) {
        let data = {};
        data['message'] = message;
        data['duration'] = duration;
        data['position'] = 'top';
        this.toast.show(data['message'], data['duration'], data['position']).subscribe(
            toast => {
            }
        );
    }

}
