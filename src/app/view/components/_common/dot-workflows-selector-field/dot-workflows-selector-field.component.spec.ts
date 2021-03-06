import { By } from '@angular/platform-browser';
import { ComponentFixture } from '@angular/core/testing';
import { DebugElement, Component } from '@angular/core';
import { async } from '@angular/core/testing';

import { DOTTestBed } from '../../../../test/dot-test-bed';
import { DotWorkflowsSelectorFieldComponent } from './dot-workflows-selector-field.component';
import {
    DotWorkflowServiceMock,
    mockWorkflows
} from './../../../../test/dot-workflow-service.mock';
import { DotWorkflowService } from './../../../../api/services/dot-workflow/dot-workflow.service';
import { MultiSelect } from 'primeng/primeng';
import { MockDotMessageService } from '../../../../test/dot-message-service.mock';
import { DotMessageService } from '@services/dot-messages-service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const messageServiceMock = new MockDotMessageService({
    'dot.common.select.workflows': 'Pick it up',
    'dot.common.archived': 'Archivado'
});

@Component({
    selector: 'dot-fake-form',
    template: `
        <form [formGroup]="form">
            <dot-workflows-selector-field formControlName="workflows"></dot-workflows-selector-field>
            {{ form.value | json }}
        </form>
    `
})
class FakeFormComponent {
    form: FormGroup;

    constructor(private fb: FormBuilder) {
        /*
            This should go in the ngOnInit but I don't want to detectChanges everytime for
            this fake test component
        */
        this.form = this.fb.group({
            workflows: [{ value: ['567', '890'], disabled: false }]
        });
    }
}

describe('DotWorkflowsSelectorFieldComponent', () => {
    let component: DotWorkflowsSelectorFieldComponent;
    let fixture: ComponentFixture<DotWorkflowsSelectorFieldComponent>;
    let de: DebugElement;
    let dotWorkflowService: DotWorkflowService;
    let multiselect: MultiSelect;

    describe('basic', () => {
        beforeEach(async(() => {
            DOTTestBed.configureTestingModule({
                declarations: [DotWorkflowsSelectorFieldComponent],
                providers: [
                    {
                        provide: DotWorkflowService,
                        useClass: DotWorkflowServiceMock
                    },
                    {
                        provide: DotMessageService,
                        useValue: messageServiceMock
                    }
                ],
                imports: [BrowserAnimationsModule]
            });

            fixture = DOTTestBed.createComponent(DotWorkflowsSelectorFieldComponent);
            component = fixture.componentInstance;
            de = fixture.debugElement;
            dotWorkflowService = de.injector.get(DotWorkflowService);
            multiselect = de.query(By.css('p-multiSelect')).componentInstance;

            spyOn(dotWorkflowService, 'get').and.callThrough();
            spyOn(component, 'propagateChange');
        }));

        describe('no params', () => {
            beforeEach(() => {
                fixture.detectChanges();
            });

            it('should have have a multiselect', () => {
                expect(multiselect).not.toBe(null);
            });

            it('should have maxSelectedLabels set correctly', () => {
                expect(multiselect.maxSelectedLabels).toBe(1);
            });

            it('should have default label', () => {
                expect(multiselect.defaultLabel).toEqual('Pick it up');
            });

            it('should get workflow list from server', () => {
                expect(dotWorkflowService.get).toHaveBeenCalledTimes(1);
            });

            describe('show options', () => {
                beforeEach(() => {
                    de.query(By.css('.ui-multiselect')).triggerEventHandler('click', {});
                    fixture.detectChanges();
                });

                it('should fill the workflows options', () => {
                    const itemsLabels = de
                        .queryAll(By.css('.ui-multiselect-items .workflow__label'))
                        .map((item) => item.nativeElement.innerText);
                    expect(itemsLabels).toEqual(mockWorkflows.map((workflow) => workflow.name));
                });

                it('should have archived item and message', () => {
                    const archivedItems = de.queryAll(By.css('.workflow__archive-label'));
                    expect(archivedItems.length).toBe(1);
                    expect(archivedItems[0].nativeElement.innerText).toBe(mockWorkflows[1].name);

                    const archivedMessage = de.queryAll(By.css('.workflow__archive-message'));
                    expect(archivedMessage.length).toBe(1);
                    expect(archivedMessage[0].nativeElement.innerText).toBe('(Archivado)');
                });
            });
        });
    });

    describe('value accessor', () => {
        let fixtureHost: ComponentFixture<FakeFormComponent>;
        let deHost: DebugElement;
        let innerMultiselect: DebugElement;

        beforeEach(async(() => {
            DOTTestBed.configureTestingModule({
                declarations: [FakeFormComponent, DotWorkflowsSelectorFieldComponent],
                providers: [
                    {
                        provide: DotWorkflowService,
                        useClass: DotWorkflowServiceMock
                    },
                    {
                        provide: DotMessageService,
                        useValue: messageServiceMock
                    }
                ],
                imports: []
            });

            fixtureHost = DOTTestBed.createComponent(FakeFormComponent);
            deHost = fixtureHost.debugElement;
            component = deHost.query(By.css('dot-workflows-selector-field')).componentInstance;
            innerMultiselect = deHost
                .query(By.css('dot-workflows-selector-field'))
                .query(By.css('p-multiSelect'));
        }));

        it('should get value', () => {
            fixtureHost.detectChanges();
            expect(component.value).toEqual(['567', '890']);
        });

        it('should propagate value', () => {
            fixtureHost.detectChanges();
            innerMultiselect.triggerEventHandler('onChange', {
                originalEvent: {},
                value: ['123']
            });
            fixtureHost.detectChanges();
            expect(fixtureHost.componentInstance.form.value).toEqual({ workflows: ['123'] });
        });

        it('should be enabled by default', () => {
            fixtureHost.detectChanges();
            expect(innerMultiselect.componentInstance.disabled).toBe(false);
        });

        it('should set disabled', () => {
            fixtureHost.componentInstance.form.get('workflows').disable();
            fixtureHost.detectChanges();
            expect(innerMultiselect.componentInstance.disabled).toBe(true);
        });
    });
});
