import { MockBackend } from '@angular/http/testing';
import { ConnectionBackend, ResponseOptions } from '@angular/http';
import { DotContainerContentletService } from './dot-container-contentlet.service';
import { ReflectiveInjector } from '@angular/core';
import { MockConnection } from '@angular/http/testing';
import { DOTTestBed } from '../../../test/dot-test-bed';
import { tick } from '@angular/core/testing';
import { fakeAsync } from '@angular/core/testing';
import { DotPageContainer } from '../../dot-edit-page/shared/models/dot-page-container.model';

describe('DotContainerContentletService', () => {
    let dotContainerContentletService: DotContainerContentletService;
    let backend: MockBackend;
    let lastConnection: any;

    beforeEach(() => {
        const injector: ReflectiveInjector = DOTTestBed.resolveAndCreate([DotContainerContentletService]);

        dotContainerContentletService = injector.get(DotContainerContentletService);
        backend = injector.get(ConnectionBackend);
        backend.connections.subscribe((connection: MockConnection) => (lastConnection = connection));
    });

    it('should do a request for get the contentlet html code', fakeAsync(() => {
        const containerId = '1';
        const contentletId = '2';

        let response;

        dotContainerContentletService.getContentletToContainer(containerId, contentletId).subscribe(resp => response = resp);

        tick();
        expect(lastConnection.request.url).toContain(`v1/containers/${containerId}/uuid/LEGACY_RELATION_TYPE/content/${contentletId}`);
    }));

    it('should do a request for save content', fakeAsync(() => {
        const pageId = '1';
        const model: DotPageContainer[] = [
            {
                identifier: '1',
                uuid: '2',
                contentletsId: ['3', '4']
            },
            {
                identifier: '5',
                uuid: '6',
                contentletsId: ['7', '8']
            }
        ];

        let response;

        dotContainerContentletService.saveContentlet(pageId, model).subscribe(resp => response = resp);

        tick();

        expect(lastConnection.request.url).toContain(`/v1/page/${pageId}/content`);
        expect(lastConnection.request.method).toEqual(1);
        expect(lastConnection.request._body).toEqual(JSON.stringify(model));
    }));
});