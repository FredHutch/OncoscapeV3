
import { OncoData } from 'app/oncoData';

function getConfigCohortName() {
  console.error('Need to suppport OncoData class in basics-spec.')
  return window.oncoData.currentCommonSidePanel._config.cohortName;
}

describe('Oncoscape toplevel tests', function() {

  var originalTimeout;

  beforeEach(function() {
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });  


  it('Click landing-button', function() {
    /*
    browser.get('https://angularjs.org');

    element(by.model('todoList.todoText')).sendKeys('write first protractor test');
    element(by.css('[value="add"]')).click();

    var todoList = element.all(by.repeater('todo in todoList.todos'));
    expect(todoList.count()).toEqual(3);
    expect(todoList.get(2).getText()).toEqual('write first protractor test');

    // You wrote your first test, cross it off the list
    todoList.get(2).element(by.css('input')).click();
    var completedAmount = element.all(by.css('.done-true'));
    expect(completedAmount.count()).toEqual(2);
    */

    browser.get('http://localhost:4201/');
    //browser.sleep(3000);
    var EC=protractor.ExpectedConditions;
    var ele = null;
    browser.wait(EC.urlIs('http://localhost:4201/')); 
    browser.waitForAngular();
    expect(browser.getTitle()).toEqual('ONCOSCAPE');    
    
     
    element(by.css('.landing-button')).click();
    console.log('Clicked landing button. Awaiting results...');
//    browser.waitForAngular();
    
    ele=element(by.xpath('//span[text() = "Glioma"]/..'));
    browser.wait(EC.visibilityOf(ele), 5000, "Could not show public data sets."); 
    console.log('Clicked landing button. After results.');

    element(by.xpath('//span[text() = "Glioma"]/..')).click();
    ele=element(by.xpath('//span[text() = "Selected Cohort"]'));
    browser.wait(EC.visibilityOf(ele), 70000, "Could not load Glioma database and display results quickly enough."); 

    console.log('About to call executeScript for cohortName.');
    browser.executeScript(getConfigCohortName).then(function (cohortName) {
      console.log('cohortName is... ');
      console.log(cohortName);
    });

    console.log('After calling executeScript for version.');
  });


  it('Placeholder 1', function() {
    var a = true;
    console.log('placeholder1');
    expect(a).toBe(true);
  });

  it('Placeholder 2', function() {
    var a = true;
    console.log('placeholder2');
    expect(a).toBe(true);
  });

});



