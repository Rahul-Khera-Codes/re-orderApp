import {Directive, ElementRef, Renderer} from '@angular/core';
import {Content} from "ionic-angular";
@Directive({
    selector: '[hide-fab]',
    host: {
        '(ionScroll)': 'handleScroll($event)'
    }
})
export class HideFabDirective {
    private fabRef;
//    private storedScroll: number = 0;
//    _timeout: any = null;
    constructor(public element: ElementRef, public renderer: Renderer) {}

    ngAfterViewInit() {
        this.fabRef = this.element.nativeElement.getElementsByClassName("fab")[0];
        this.renderer.setElementStyle(this.fabRef, 'webkitTransition', 'transform 500ms,top 500ms');
        this.renderer.setElementStyle(this.fabRef, 'top', '75px');
        this.renderer.setElementStyle(this.fabRef, 'webkitTransform', 'scale3d(.1,.1,.1)');
    }


    handleScroll(event: Content) {
        if (event.scrollTop < 100) {
            this.renderer.setElementStyle(this.fabRef, 'top', '75px');
            this.renderer.setElementStyle(this.fabRef, 'webkitTransform', 'scale3d(.1,.1,.1)');
        } else {
            this.renderer.setElementStyle(this.fabRef, 'top', '0');
            this.renderer.setElementStyle(this.fabRef, 'webkitTransform', 'scale3d(1,1,1)');
        }
        //        if (event.scrollTop) {
        //            this.renderer.setElementStyle(this.fabRef, 'top', '75px');
        //                        this.renderer.setElementStyle(this.fabRef, 'webkitTransform', 'scale3d(.1,.1,.1)');
        //        }
        //        if (this._timeout) {
        //            window.clearTimeout(this._timeout);
        //        }
        //        this._timeout = setTimeout(() => {
        //            this._timeout = null;
        //            if (event.scrollTop > 279) {
        //                this.renderer.setElementStyle(this.fabRef, 'top', '0');
        //                this.renderer.setElementStyle(this.fabRef, 'webkitTransform', 'scale3d(1,1,1)');
        //            }
        //        }, 100);
//        this.storedScroll = event.scrollTop;
    }
}