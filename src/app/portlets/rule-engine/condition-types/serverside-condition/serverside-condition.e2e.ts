import {TestInputDropdown} from '../../../../../e2e/CwProtractor';
import { browser, by, element } from 'protractor';

class TextInput {
  root: any;
  valueInput: any;

  constructor(root: any) {
    this.root = root;
    this.valueInput = element(by.tagName('INPUT'));
  }
}

class PageInputs {
  demoOneRequestHeaderDD: TestInputDropdown = new TestInputDropdown(element.all(by.tagName('cw-input-dropdown')).get(0));
  demoOneComparisonDD: TestInputDropdown = new TestInputDropdown(element.all(by.tagName('cw-input-dropdown')).get(1));
  demoOneRequestValueTF: TextInput = new TextInput(element.all(by.tagName('cw-input-text')).get(0));
}

class ServerSideConditionPage {
  url = 'http://localhost:9000/build/view/components/rule-engine/condition-types/serverside-condition/index.html';
  title = 'Serverside Condition Demo';
  inputs: PageInputs = new PageInputs();

}

describe('The serverside condtion demo', () => {
  it('should have a title.', () => {
    let page = new ServerSideConditionPage();
    browser.get(page.url);
    expect<any>(browser.getTitle()).toEqual(page.title);
  });

  it('should have three inputs from demo one.', () => {
    let page = new ServerSideConditionPage();
    browser.get(page.url);
    expect(page.inputs.demoOneRequestHeaderDD.el).toBeDefined('Dropdown for demo 1 should exist');
    expect(page.inputs.demoOneRequestHeaderDD.search).toBeDefined('Search box demo 1 should exist');
    expect(page.inputs.demoOneRequestHeaderDD.valueInput).toBeDefined('Hidden input for demo 1 should exist');
  });

  it('has 43 pre-defined optoin values for the header-value dropdown.', () => {
    let page = new ServerSideConditionPage();
    browser.get(page.url);
    let dd = page.inputs.demoOneRequestHeaderDD;
    expect(dd.items.count()).toEqual(43);
  });

  it('has 7 pre-defined option values for the comparison dropdown.', () => {
    let page = new ServerSideConditionPage();
    browser.get(page.url);
    let dd = page.inputs.demoOneComparisonDD;
    expect(dd.items.count()).toEqual(7);
  });

  it('has a text-input field for the user value.', () => {
    let page = new ServerSideConditionPage();
    browser.get(page.url);
    let tf = page.inputs.demoOneRequestValueTF;
    expect(tf.root).toBeDefined('The header value textfield should exist.');
    expect(tf.valueInput).toBeDefined('The header value textfield should have an input element child.');
    expect(tf.valueInput.getAttribute('placeholder')).toEqual('header-value', 'The placeholder should be set.');
  });

  it('allows searching on the header-value dropdown.', () => {
    let page = new ServerSideConditionPage();
    browser.get(page.url);
    page = new ServerSideConditionPage();
    let dd = page.inputs.demoOneRequestHeaderDD;
    let compareDD = page.inputs.demoOneComparisonDD;
    dd.search.sendKeys('Conn');
    let visibleItems = dd.menu.all(by.css('[class="item selected"]'));
    expect(visibleItems.count()).toEqual(1, 'There should only be one element unfiltered, and it should be selected.');
    compareDD.el.click(); // click away from this dd to close menu and set value.
    let value = dd.getValueText();
    expect(value).toEqual('Connection', 'Value should have been set to Connection because it was only search result.');
  });
});