import {ToastController} from 'ionic-angular';
import {Injectable} from '@angular/core';
@Injectable()
export class ToastProvider {

    constructor(public toastCtrl: ToastController) {
    }
    presentToast(message, duration) {
        let data = {};
        data['message'] = message;
        data['duration'] = duration;
        data['position'] = 'top';
        let toast = this.toastCtrl.create(data);
        toast.present();
    }

}
