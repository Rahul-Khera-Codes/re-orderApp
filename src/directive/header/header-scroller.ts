import {Directive, ElementRef, Renderer, Input} from '@angular/core';
import {Platform} from 'ionic-angular';
import {Content} from "ionic-angular";

import * as $ from 'jquery';
@Directive({
    selector: '[header-scroller]',
    host: {
        '(ionScroll)': 'handleScroll($event)'
    }
})
export class HeaderScroller {
    scrollToTop = 0;
    @Input('header-scroller') value: boolean;
    refGrid: any;
    private storedScroll: number = 0;
    private threshold: number = 10;
    protected _topTriggeringDistance: number = 150;
    constructor(private _platform: Platform, private renderer: Renderer, public el: ElementRef) {
    }

    ngOnInit() {

    }
    ngAfterViewInit() {
        this.refGrid = this.el.nativeElement.getElementsByClassName('grid')[0];
        this.renderer.setElementStyle(this.refGrid, 'webkitTransition', 'transform 500ms,top 500ms');
        this.renderer.setElementStyle(this.refGrid, 'top', '56px');
    }
    handleScroll(event: Content) {
        if (event.scrollTop - this.storedScroll > this.threshold) {
            this.renderer.setElementStyle(this.refGrid, 'top', '-56px');
        } else if (event.scrollTop - this.storedScroll < 0) {
            this.renderer.setElementStyle(this.refGrid, 'top', '56px');
        }
        this.storedScroll = event.scrollTop;
    }
    protected _bindScroller(el): void {
        this.renderer.listen(el, 'scroll', (event) => {
            if (event.target.scrollTop < this.scrollToTop && ((this.scrollToTop - event.target.scrollTop) > 50)) {
                this.scrollToTop = event.target.scrollTop;
            }
            else if (event.target.scrollTop > this.scrollToTop) {
                if (event.target.scrollTop > this._topTriggeringDistance) {
                    let contentsize = ('-' + $('.scroll').height() + 'px')
                }
                this.scrollToTop = event.target.scrollTop;

            }

        })

    }
}