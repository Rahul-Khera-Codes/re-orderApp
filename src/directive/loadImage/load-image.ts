import {Directive, ElementRef, Renderer} from '@angular/core';
import {FileTransfer, FileTransferObject} from '@ionic-native/file-transfer';
import {Platform} from 'ionic-angular';
import {File} from '@ionic-native/file';

@Directive({
    selector: '[imageDirective]',
    host: {'(load)': 'handleLoad()', '(error)': 'fixImageUrl()'}
})
export class ImageDirective {
    storageDirectory: string = '';

    constructor(private transfer: FileTransfer, public platform: Platform, private file: File, private _el: ElementRef, private renderer: Renderer) {
        this.platform.ready().then(() => {
            if (!this.platform.is('cordova')) {
                return false;
            }

            if (this.platform.is('ios')) {
                this.storageDirectory = this.file.documentsDirectory;
            }
            else if (this.platform.is('android')) {
                this.storageDirectory = this.file.dataDirectory;
            }
            else {
                return false;
            }
        })
    }
    downloadImage(image) {
        const fileTransfer: FileTransferObject = this.transfer.create();
        let img = image.split("/");
        this.file.checkFile(this.storageDirectory, img[img.length - 1])
            .then(() => {})
            .catch((err) => {
                fileTransfer.download(image, this.storageDirectory + img[img.length - 1]).then((entry) => {
                }, (err) => {console.log("err", err)});
            });
    }
    retrieveImage(image) {
        return new Promise((resolve, reject) => {
            let img = image.split("/");
            this.file.checkFile(this.storageDirectory, img[img.length - 1])
                .then((res) => {
                    resolve(this.storageDirectory + img[img.length - 1])
                })
                .catch((err) => {
                    reject(err.code)
                });
        });
    }
    fixImageUrl() {
        this.retrieveImage(this._el.nativeElement.src).then(path => {
            this._el.nativeElement.src = path;
        }, (err) => {
            this._el.nativeElement.src = 'assets/imgs/default.jpg';
        })
    }
    handleLoad() {
        this.downloadImage(this._el.nativeElement.src);
    }
}