import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
    selector: 'ion-searchbar[select-all],ion-input[select-all]'
})
export class SelectAll {

    constructor(private el: ElementRef) {
    }

    @HostListener('focus')
    selectAll() {
        // access to the native input element
        let nativeEl: HTMLInputElement = this.el.nativeElement.querySelector('input');
        if (nativeEl) {
            if (nativeEl.setSelectionRange) {
                // select the text from start to end
                return nativeEl.setSelectionRange(0, nativeEl.value.length);
            }

            nativeEl.select();
        }
    }

}