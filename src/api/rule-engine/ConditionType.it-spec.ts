import * as Rx from 'rxjs/Rx'

import {ConditionService, ConditionModel} from '../../api/rule-engine/Condition';

import {Injector, Provider} from 'angular2/core';

import {DataStore} from '../../api/persistence/DataStore'
import {LocalDataStore} from '../../api/persistence/LocalDataStore';
import {RestDataStore} from '../../api/persistence/RestDataStore';

import {ApiRoot} from '../../api/persistence/ApiRoot';
import {UserModel} from '../../api/auth/UserModel';
import {EntityMeta, EntitySnapshot} from '../../api/persistence/EntityBase';


import {ConditionTypeService} from '../../api/rule-engine/ConditionType';
import {CwChangeEvent} from '../../api/util/CwEvent';
import {I18nService} from "../system/locale/I18n";
import {ServerSideTypeModel} from "./ServerSideFieldModel";

var injector = Injector.resolveAndCreate([
  ApiRoot,
  I18nService,
  UserModel,
  ConditionTypeService,
  new Provider(DataStore, {useClass: RestDataStore})
])

describe('Integration.api.rule-engine.RuleService', function () {

  var typeService:ConditionTypeService
  var subscriptions:Array<Rx.Subscription<ServerSideTypeModel>>

  beforeEach(function () {
    subscriptions = []
    typeService = injector.get(ConditionTypeService)

  });

  afterEach(function(){
    subscriptions.forEach((sub:Rx.Subscription<ServerSideTypeModel>)=>{
      sub.unsubscribe()
    })
  })

  it("Can list condition types, and they are all persisted and valid.", function(done){
    let count = 0;
    let subscription = typeService.list().subscribe((conditionType:ServerSideTypeModel) => {
      count++
    }, (err) => {
      expect(err).toBeUndefined("error was thrown creating Rule.")
      done()
    })
    subscriptions.push(subscription) // for cleanup.

    typeService.list((types:Array<ServerSideTypeModel>)=>{
      expect(count).toEqual(types.length, "onAdd subscriber notification count should be same as number of types provided to callback.")
      types.forEach((type:ServerSideTypeModel)=>{
        expect(type.isPersisted()).toBe(true, "Condition types are readonly and should always be persisted.")
        expect(type.isValid()).toBe(true, "Condition types are readonly and should always be valid.")
      })
      done()
    })
  })

  it("There are three active condition types.", function(done){
    typeService.list((types:Array<ServerSideTypeModel>)=>{
      expect(types.length).toEqual(3, "We have only enabled three condition types. Please update name of test when you update this expectation.")
      done()
    })
  })

});