import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ParameterDefinition } from '../../services/util/CwInputModel';
import { CwDropdownInputModel } from '../../services/util/CwInputModel';
import { CwComponent } from '../../services/util/CwComponent';
import { ServerSideFieldModel } from '../../services/ServerSideFieldModel';
import { I18nService } from '../../services/system/locale/I18n';
import { ObservableHack } from '../../services/util/ObservableHack';
import { CwRestDropdownInputModel } from '../../services/util/CwInputModel';
import { Verify } from '../../services/validation/Verify';
import { ParameterModel } from '../../services/Rule';
import { LoggerService } from 'dotcms-js/dotcms-js';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'cw-serverside-condition',
    template: `<form>
  <div flex layout="row" class="cw-condition-component-body">
    <ng-template ngFor let-input [ngForOf]="_inputs">
      <div *ngIf="input.type == 'spacer'" flex class="cw-input cw-input-placeholder">&nbsp;</div>
      <cw-input-dropdown *ngIf="input.type == 'dropdown'"
                         flex
                         class="cw-input"
                         [hidden]="input.argIndex !== null && input.argIndex >= _rhArgCount"
                         [formControl]="input.control"
                         [required]="input.required"
                         [allowAdditions]="input.allowAdditions"
                         [class.cw-comparator-selector]="input.name == 'comparison'"
                         [class.cw-last]="islast"
                         (touch)="onBlur(input)"
                         placeholder="{{input.placeholder | async}}">
        <cw-input-option
            *ngFor="let opt of input.options"
            [value]="opt.value"
            [label]="opt.label | async"
            icon="{{opt.icon}}"></cw-input-option>
      </cw-input-dropdown>

      <div flex layout-fill layout="column" class="cw-input" [class.cw-last]="islast" *ngIf="input.type == 'restDropdown'">
        <cw-input-rest-dropdown flex
                                class="cw-input"
                                [value]="input.value"
                                [formControl]="input.control"
                                [hidden]="input.argIndex !== null && input.argIndex >= _rhArgCount"
                                placeholder="{{input.placeholder | async}}"
                                [minSelections]="input.minSelections"
                                [maxSelections]="input.maxSelections"
                                optionUrl="{{input.optionUrl}}"
                                optionValueField="{{input.optionValueField}}"
                                optionLabelField="{{input.optionLabelField}}"
                                [required]="input.required"
                                [allowAdditions]="input.allowAdditions"
                                [class.cw-comparator-selector]="input.name == 'comparison'"
                                [class.cw-last]="islast"
                                (touch)="onBlur(input)"
                                #rdInput="ngForm"
                                >
        </cw-input-rest-dropdown>
        <div flex="50" *ngIf="rdInput.touched && !rdInput.valid && (input.argIndex == null || input.argIndex < _rhArgCount)"
            class="name cw-warn basic label">{{getErrorMessage(input)}}</div>
      </div>

      <div flex layout-fill layout="column" class="cw-input" [class.cw-last]="islast" *ngIf="input.type == 'text' || input.type == 'number'">
        <cw-input-text
            flex
            [placeholder]="input.placeholder | async"
            [formControl]="input.control"
            [type]="input.type"
            [hidden]="input.argIndex !== null && input.argIndex >= _rhArgCount"
            (blur)="onBlur(input)"
            #fInput="ngForm"
        ></cw-input-text>
        <div flex="50" *ngIf="fInput.touched && !fInput.valid && (input.argIndex == null || input.argIndex < _rhArgCount)"
            class="name cw-warn basic label">{{getErrorMessage(input)}}</div>
      </div>

      <cw-input-date *ngIf="input.type == 'datetime'"
                     flex
                    layout-fill
                     class="cw-input"
                     [formControl]="input.control"
                     [class.cw-last]="islast"
                     [placeholder]="input.placeholder | async"
                     [hidden]="input.argIndex !== null && input.argIndex >= _rhArgCount"
                     [value]="input.value"
                     (blur)="onBlur(input)"
                     #gInput="ngForm"
      ></cw-input-date>
    </ng-template>
  </div>
</form>`
})
export class ServersideCondition {
    @Input() componentInstance: ServerSideFieldModel;
    @Output()
    parameterValueChange: EventEmitter<{ name: string; value: string }> = new EventEmitter(false);

    _inputs: Array<any>;
    private _resources: I18nService;
    private _rhArgCount: boolean;

    private _errorMessageFormatters = {
        minLength: 'Input must be at least ${len} characters long.',
        noQuotes: 'Input cannot contain quote [" or \'] characters.',
        required: 'Required'
    };

    private static getRightHandArgCount(selectedComparison): boolean {
        let argCount = null;
        if (selectedComparison) {
            argCount = Verify.isNumber(selectedComparison.rightHandArgCount)
                ? selectedComparison.rightHandArgCount
                : 1;
        }
        return argCount;
    }

    private static isComparisonParameter(input): boolean {
        return input && input.name === 'comparison';
    }

    // tslint:disable-next-line:no-unused-variable
    private static getSelectedOption(input, value): any {
        let opt = null;
        const optAry = input.options.filter(e => e.value === value);

        if (optAry && optAry.length === 1) {
            opt = optAry[0];
        }
        return opt;
    }

    constructor(fb: FormBuilder, resources: I18nService, private loggerService: LoggerService) {
        this._resources = resources;
        this._inputs = [];
    }

    ngOnChanges(change): void {
        let paramDefs = null;
        if (change.componentInstance) {
            this._rhArgCount = null;
            paramDefs = this.componentInstance.type.parameters;
        }
        if (paramDefs) {
            let prevPriority = 0;
            this._inputs = [];
            Object.keys(paramDefs).forEach(key => {
                const paramDef = this.componentInstance.getParameterDef(key);
                const param = this.componentInstance.getParameter(key);
                if (paramDef.priority > prevPriority + 1) {
                    this._inputs.push({ flex: 40, type: 'spacer' });
                }
                prevPriority = paramDef.priority;
                this.loggerService.info('ServersideCondition', 'onChange', 'params', key, param);
                const input = this.getInputFor(paramDef.inputType.type, param, paramDef);
                this._inputs.push(input);
            });

            let comparison;
            let comparisonIdx = null;
            this._inputs.forEach((input: any, idx) => {
                if (ServersideCondition.isComparisonParameter(input)) {
                    comparison = input;
                    this.applyRhsCount(comparison.value);
                    comparisonIdx = idx;
                } else if (comparisonIdx !== null) {
                    if (this._rhArgCount !== null) {
                        input.argIndex = idx - comparisonIdx - 1;
                    }
                }
            });
            if (comparison) {
                this.applyRhsCount(comparison.value);
            }
        }
    }

    /**
   * Brute force error messages from lookup table for now.
   * @todo look up the known error formatters by key ('required', 'minLength', etc) from the I18NResource endpoint
   * and pre-cache them, so that we can retrieve them synchronously.
   */
    getErrorMessage(input): string {
        const control = input.control;
        let message = '';
        Object.keys(control.errors || {}).forEach(key => {
            const err = control.errors[key];
            message += this._errorMessageFormatters[key];
            if (Object.keys(err).length) {
                // tslint:disable-next-line:no-debugger
            }
        });
        return message;
    }

    onBlur(input): void {
        if (input.control.dirty) {
            this.setParameterValue(input.name, input.control.value, input.control.valid, true);
        }
    }

    setParameterValue(name: string, value: any, valid: boolean, isBlur = false): void {
        this.parameterValueChange.emit({ name, value });
        if (name === 'comparison') {
            this.applyRhsCount(value);
        }
    }

    getInputFor(type: string, param, paramDef: ParameterDefinition): any {
        const i18nBaseKey = paramDef.i18nBaseKey || this.componentInstance.type.i18nKey;
        /* Save a potentially large number of requests by loading parent key: */
        this._resources.get(i18nBaseKey).subscribe(() => {});

        let input;
        if (type === 'text' || type === 'number') {
            input = this.getTextInput(param, paramDef, i18nBaseKey);
            this.loggerService.info('ServersideCondition', 'getInputFor', type, paramDef);
        } else if (type === 'datetime') {
            input = this.getDateTimeInput(param, paramDef, i18nBaseKey);
        } else if (type === 'restDropdown') {
            input = this.getRestDropdownInput(param, paramDef, i18nBaseKey);
        } else if (type === 'dropdown') {
            input = this.getDropdownInput(param, paramDef, i18nBaseKey);
        }
        input.type = type;
        return input;
    }

    private getTextInput(param, paramDef, i18nBaseKey: string): any {
        const rsrcKey = i18nBaseKey + '.inputs.' + paramDef.key;
        const placeholderKey = rsrcKey + '.placeholder';
        const control = ServerSideFieldModel.createNgControl(this.componentInstance, param.key);
        return {
            control: control,
            name: param.key,
            placeholder: this._resources.get(placeholderKey, paramDef.key),
            required: paramDef.inputType.dataType['minLength'] > 0
        };
    }

    private getDateTimeInput(param, paramDef, i18nBaseKey: string): any {
        // tslint:disable-next-line:no-unused-variable
        const rsrcKey = i18nBaseKey + '.inputs.' + paramDef.key;
        return {
            control: ServerSideFieldModel.createNgControl(this.componentInstance, param.key),
            name: param.key,
            required: paramDef.inputType.dataType['minLength'] > 0,
            value: this.componentInstance.getParameterValue(param.key),
            visible: true
        };
    }

    private getRestDropdownInput(param, paramDef, i18nBaseKey: string): any {
        const inputType: CwRestDropdownInputModel = <CwRestDropdownInputModel>paramDef.inputType;
        const rsrcKey = i18nBaseKey + '.inputs.' + paramDef.key;
        const placeholderKey = rsrcKey + '.placeholder';

        let currentValue = this.componentInstance.getParameterValue(param.key);
        if (
            currentValue &&
            (currentValue.indexOf('"') !== -1 || currentValue.indexOf('\'') !== -1)
        ) {
            currentValue = currentValue.replace(/["']/g, '');
            this.componentInstance.setParameter(param.key, currentValue);
        }
        const control = ServerSideFieldModel.createNgControl(this.componentInstance, param.key);
        const input: any = {
            allowAdditions: inputType.allowAdditions,
            control: control,
            maxSelections: inputType.maxSelections,
            minSelections: inputType.minSelections,
            name: param.key,
            optionLabelField: inputType.optionLabelField,
            optionUrl: inputType.optionUrl,
            optionValueField: inputType.optionValueField,
            placeholder: this._resources.get(placeholderKey, paramDef.key),
            required: inputType.minSelections > 0,
            value: currentValue
        };
        if (!input.value) {
            input.value = inputType.selected != null ? inputType.selected : '';
        }
        return input;
    }

    private getDropdownInput(
        param: ParameterModel,
        paramDef: ParameterDefinition,
        i18nBaseKey: string
    ): CwComponent {
        const inputType: CwDropdownInputModel = <CwDropdownInputModel>paramDef.inputType;
        const opts = [];
        const options = inputType.options;
        let rsrcKey = i18nBaseKey + '.inputs.' + paramDef.key;
        const placeholderKey = rsrcKey + '.placeholder';
        if (param.key === 'comparison') {
            rsrcKey = 'api.sites.ruleengine.rules.inputs.comparison';
        } else {
            rsrcKey = rsrcKey + '.options';
        }

        const currentValue = this.componentInstance.getParameterValue(param.key);
        let needsCustomAttribute = currentValue != null;

        Object.keys(options).forEach((key: any) => {
            const option = options[key];
            if (needsCustomAttribute && key === currentValue) {
                needsCustomAttribute = false;
            }
            let labelKey = rsrcKey + '.' + option.i18nKey;
            // hack for country - @todo ggranum: kill 'name' on locale?
            if (param.key === 'country') {
                labelKey = i18nBaseKey + '.' + option.i18nKey + '.name';
            }

            opts.push({
                icon: option.icon,
                label: this._resources.get(labelKey, option.i18nKey),
                rightHandArgCount: option.rightHandArgCount,
                value: key
            });
        });

        if (needsCustomAttribute) {
            opts.push({
                label: ObservableHack.of(currentValue),
                value: currentValue
            });
        }
        const input: any = {
            allowAdditions: inputType.allowAdditions,
            control: ServerSideFieldModel.createNgControl(this.componentInstance, param.key),
            maxSelections: inputType.maxSelections,
            minSelections: inputType.minSelections,
            name: param.key,
            options: opts,
            placeholder: this._resources.get(placeholderKey, paramDef.key),
            required: inputType.minSelections > 0,
            value: currentValue
        };
        if (!input.value) {
            input.value = inputType.selected != null ? inputType.selected : '';
        }
        return input;
    }

    private applyRhsCount(selectedComparison: string): void {
        const comparisonDef = this.componentInstance.getParameterDef('comparison');
        const comparisonType: CwDropdownInputModel = <CwDropdownInputModel>comparisonDef.inputType;
        const selectedComparisonDef = comparisonType.options[selectedComparison];
        this._rhArgCount = ServersideCondition.getRightHandArgCount(selectedComparisonDef);
    }
}
