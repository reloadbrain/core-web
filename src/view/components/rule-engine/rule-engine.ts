/// <reference path="../../../../jspm_packages/npm/angular2@2.0.0-alpha.44/angular2.d.ts" />
/// <reference path="../../../../jspm_packages/npm/@reactivex/rxjs@5.0.0-alpha.7/dist/cjs/Rx.KitchenSink.d.ts" />

import {bootstrap, Provider, NgFor, NgIf, Component, Directive, View, Inject} from 'angular2/angular2';

import * as Rx from '@reactivex/rxjs@5.0.0-alpha.7/dist/cjs/Rx.KitchenSink'



import {ApiRoot} from 'api/persistence/ApiRoot';
import {EntityMeta, EntitySnapshot} from 'api/persistence/EntityBase';
import {ActionTypesProvider} from 'api/rule-engine/ActionType';
import {ConditionTypesProvider} from 'api/rule-engine/ConditionTypes';
import {UserModel} from "api/auth/UserModel";
import {I18NCountryProvider} from 'api/system/locale/I18NCountryProvider'


import {RuleComponent} from './rule-component';
import {RuleService, RuleModel} from "api/rule-engine/Rule";
import {ActionService} from "api/rule-engine/Action";
import {CwChangeEvent} from "api/util/CwEvent";
import {RestDataStore} from "api/persistence/RestDataStore";
import {DataStore} from "api/persistence/DataStore";
import {ConditionGroupService} from "api/rule-engine/ConditionGroup";
import {ConditionService} from "api/rule-engine/Condition";


/**
 *
 */
@Component({
  selector: 'cw-rule-engine'
})
@View({
  template: `<div flex layout="column" class="cw-rule-engine">
  <div flex layout="row" layout-align="space-between center" class="cw-header">
    <div flex layout="row" layout-align="space-between center" class="ui icon input">
      <i class="filter icon"></i>
      <input type="text" placeholder="Start typing to filter rules..." [value]="filterText" (keyup)="filterText = $event.target.value">
    </div>
    <div flex="2"></div>
    <button  class="ui button cw-button-add" aria-label="Create a new Rule" (click)="addRule()" [disabled]="ruleStub != null">
      <i class="plus icon" aria-hidden="true"></i>Add Rule
    </button>
  </div>
  <rule flex layout="row" *ng-for="var r of rules" [rule]="r" [hidden]="!(filterText == '' || r.name.toLowerCase().includes(filterText?.toLowerCase()))"></rule>
</div>

`,
  directives: [RuleComponent, NgFor, NgIf]
})
class RuleEngineComponent {
  rules:RuleModel[];
  filterText:string;
  private ruleService:RuleService;
  private ruleStub:RuleModel
  private stubWatch:Rx.Subscription

  constructor(@Inject(RuleService) ruleService:RuleService) {
    this.ruleService = ruleService;
    this.filterText = ""
    this.rules = []
    this.ruleService.onAdd.subscribe(
        (rule:RuleModel) => { this.handleAdd(rule) },
        (err) => { this.handleAddError(err) } )
    this.ruleService.onRemove.subscribe(
        (rule:RuleModel) => { this.handleRemove(rule) },
        (err) => { this.handleRemoveError(err) })
    this.ruleService.list()
  }

  handleAdd(rule:RuleModel) {
    if (rule === this.ruleStub) {
      this.stubWatch.unsubscribe()
      this.stubWatch = null
      this.ruleStub = null
    } else {
      this.rules.push(rule)
      rule.onChange.subscribe((event:CwChangeEvent<RuleModel>) => { this.handleRuleChange(event)})
    }
  }

  handleRuleChange(event:CwChangeEvent<RuleModel>){
    if(event.target.valid){
      this.ruleService.save(event.target)
    }
  }

  handleRemove(rule:RuleModel) {
    this.rules = this.rules.filter((arrayRule) => {
      return arrayRule.key !== rule.key
    })

    // @todo ggranum: we're leaking Subscribers here, sadly. Might cause issues for long running edit sessions.
  }

  handleAddError(err) {
    console.log('Could not add rule: ', err.message, err);
  }

  handleRemoveError(err) {
    console.log('Something went wrong: ' + err.message);

  }

  addRule() {
    this.ruleStub = new RuleModel()
    this.rules.push(this.ruleStub)
    this.stubWatch = this.ruleStub.onValidityChange.subscribe((event) => {
      if(event.valid){
        this.ruleService.save(this.ruleStub)
      }
    })
  }

}


export function main() {


  let app = bootstrap(RuleEngineComponent, [ApiRoot,
    ActionTypesProvider,
    ConditionTypesProvider,
    UserModel,
    I18NCountryProvider,
    RuleService,
    ActionService,
    ConditionGroupService,
    ConditionService,
    new Provider(DataStore, {useClass: RestDataStore})
  ])
  app.then((appRef) => {
    console.log("Bootstrapped App: ", appRef)
  }).catch((e) => {
    console.log("Error bootstrapping app: ", e)
    throw e;
  });
  return app
}
