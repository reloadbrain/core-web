import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';

import { DotRenderedPageState } from '../../shared/models/dot-rendered-page-state.model';
import { DotMessageService } from '@services/dot-messages-service';
import { SiteService } from 'dotcms-js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Site } from 'dotcms-js/lib/core/treeable/shared/site.model';

/**
 * Basic page information for edit mode
 *
 * @export
 * @class DotEditPageInfoComponent
 * @implements {OnInit}
 */
@Component({
    selector: 'dot-edit-page-info',
    templateUrl: './dot-edit-page-info.component.html',
    styleUrls: ['./dot-edit-page-info.component.scss']
})
export class DotEditPageInfoComponent implements OnInit {
    @Input() pageState: DotRenderedPageState;

    @ViewChild('lockedPageMessage') lockedPageMessage: ElementRef;

    url$: Observable<string>;

    constructor(private siteService: SiteService, public dotMessageService: DotMessageService) {}

    ngOnInit() {
        this.dotMessageService
            .getMessages([
                'dot.common.message.pageurl.copied.clipboard',
                'dot.common.message.pageurl.copied.clipboard.error',
                'editpage.toolbar.page.cant.edit',
                'editpage.toolbar.page.locked.by.user'
            ])
            .subscribe();

        this.url$ = this.getFullUrl(this.pageState.page.pageURI);
    }

    /**
     * Make the lock message blink with css
     *
     * @memberof DotEditPageInfoComponent
     */
    blinkLockMessage(): void {
        const blinkClass = 'page-info__locked-by-message--blink';

        this.lockedPageMessage.nativeElement.classList.add(blinkClass);
        setTimeout(() => {
            this.lockedPageMessage.nativeElement.classList.remove(blinkClass);
        }, 500);
    }

    private getFullUrl(url: string): Observable<string> {
        return this.siteService.getCurrentSite().pipe(
            map((site: Site) => {
                return [
                    location.protocol,
                    '//',
                    site.name,
                    location.port ? `:${location.port}` : '',
                    url
                ].join('');
            })
        );
    }
}
