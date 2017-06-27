import { ActionHeaderOptions } from '../../../view/components/listing-data-table/action-header/action-header';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../../view/components/_common/_base/base-component';
import { Component, ViewEncapsulation } from '@angular/core';
import { ContentTypesInfoService } from '../../../api/services/content-types-info';
import { DataTableColumn } from '../../../view/components/listing-data-table/listing-data-table.component';
import { MessageService } from '../../../api/services/messages-service';

/**
 * List of Content Types
 * use: listing-data-table.component
 * @export
 * @class ContentTypesPortletComponent
 * @extends {BaseComponent}
 */
@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'content-types',
    templateUrl: 'content-types.component.html'
})
export class ContentTypesPortletComponent extends BaseComponent {
    public contentTypeColumns: DataTableColumn[];
    public item: any;
    public actionHeaderOptions: ActionHeaderOptions;

    constructor(
        messageService: MessageService,
        private router: Router,
        private route: ActivatedRoute,
        private contentTypesInfoService: ContentTypesInfoService
    ) {
        super(
            [
                'Structure-Name',
                'Variable',
                'Description',
                'Entries',
                'delete',
                'Actions',
                'message.structure.delete.structure.and.content',
                'message.structure.cantdelete',
                'File',
                'Content',
                'Form',
                'Persona',
                'Widget',
                'Page'
            ],
            messageService
        );
    }

    /**
     * Callback call from BaseComponent when the messages are received.
     * @memberOf ContentTypesPortletComponent
     */
    onMessage(): void {
        this.actionHeaderOptions = {
            primary: {
                command: $event => {
                    this.createContentType($event);
                },
                model: [
                    {
                        command: $event => {
                            this.createContentType('content', $event);
                        },
                        icon: 'fa-newspaper-o',
                        label: this.i18nMessages['Content']
                    },
                    {
                        command: $event => {
                            this.createContentType('widget', $event);
                        },
                        icon: 'fa-cog',
                        label: this.i18nMessages['Widget']
                    },
                    {
                        command: $event => {
                            this.createContentType('file', $event);
                        },
                        icon: 'fa-file-o',
                        label: this.i18nMessages['File']
                    },
                    {
                        command: $event => {
                            this.createContentType('page', $event);
                        },
                        icon: 'fa-file-text-o',
                        label: this.i18nMessages['Page']
                    },
                    {
                        command: $event => {
                            this.createContentType('persona', $event);
                        },
                        icon: 'fa-user',
                        label: this.i18nMessages['Persona']
                    }
                ]
            },
            secondary: [
                {
                    label: this.i18nMessages['Actions'],
                    model: [
                        {
                            command: $event => {
                                // DELETE DATA
                            },
                            deleteOptions: {
                                confirmHeader: this.i18nMessages[
                                    'message.structure.cantdelete'
                                ],
                                confirmMessage: this.i18nMessages[
                                    'message.structure.delete.structure.and.content'
                                ]
                            },
                            icon: 'fa-close',
                            label: this.i18nMessages['delete']
                        }
                    ]
                }
            ]
        };

        this.contentTypeColumns = [
            {
                fieldName: 'name',
                header: this.i18nMessages['Structure-Name'],
                icon: (item: any): string => this.contentTypesInfoService.getIcon(item.type),
                sortable: true,
                width: '35%'
            },
            {
                fieldName: 'velocityVarName',
                header: this.i18nMessages['Variable'],
                width: '10%'
            },
            {
                fieldName: 'description',
                header: this.i18nMessages['Description'],
                width: '35%'
            },
            {
                fieldName: 'nEntries',
                header: this.i18nMessages['Entries'],
                width: '10%'
            },
            {
                fieldName: 'mod_date',
                format: 'date',
                header: 'Last Edit Date',
                sortable: true,
                width: '10%'
            }
        ];
    }

    private createContentType(type: string, $event?): void {
        this.router.navigate(['create', type], { relativeTo: this.route });
    }

    private editContentType($event): void {
        this.router.navigate([`edit/${$event.data.identifier}`], {
            relativeTo: this.route
        });
    }
}