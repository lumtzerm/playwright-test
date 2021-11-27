//$env:PWDEBUG=1 
const { test, expect } = require('@playwright/test');
const {getNextMonday, getNextMondayDayDate, calculateTravelMinutes, calculateTravelTime} = require('../src/helpers/helper');

test('basic test', async ({ page }) => {
  //var Helper = new Helper();
  await page.goto('https://novy.regiojet.cz/');

  await page.click('button:has-text("Přijmout vše")');

  await page.fill('[aria-label="Odkud"]', 'Ostrava');
  await page.press('[aria-label="Odkud"]', 'Enter');

  await page.fill('[aria-label="Kam"]', 'Brno');
  await page.press('[aria-label="Kam"]', 'Enter');

  await page.click('[data-id="departure-date"]');

  await page.click('.CalendarDay__firstDayOfWeek:text-is(" ' + getNextMondayDayDate(getNextMonday()) + ' ")') ;

  await page.click('text=Hledat');

  //wait till connection cards are loaded
  await page.waitForSelector('ul > li > div');

  //list all connection cards
  const list = await page.$$('ul > li > div');

  const connections = [];

  for (const element of list) { //const is block scoped
    //document.querySelectorAll('ul > li > div * > span[aria-label~="cesty"]')
    let departureArrival = (await (await element.$(' * > h2')).innerText()).split(' - ');
    let travelTimeArray = (await (await element.$(' * > span')).innerText()).split(/(\s+)/);
    let priceArray = (await (await element.$(' * > button')).innerText()).split(/(\s+)/);
    let price = "NotInitialized"
    //TODO: extract to function, rewrite as ternary
    if (priceArray.length === 3){
      price = priceArray[0];
    } else {
      price = priceArray[2];
    }
    let isDirect = (await element.innerText()).includes('Přímý');

    let connection = new Connection(departureArrival[0], departureArrival[1], travelTimeArray[0], price, isDirect);
    
    connections.push(connection);    
  };

  console.log(connections.sort((a, b) =>
    calculateTravelMinutes(a.travelTime) - calculateTravelMinutes(b.travelTime)));
  

  //sort by price, ascending | does not need parseInt because we are deducting in sort
  //console.log(connections.sort((a, b) => a.price - b.price));

  for (const connection of connections) {
    let arrivalDateTime = getNextMonday().setHours(connection.arrivalTime.split(':')[0], 
      connection.arrivalTime.split(':')[1], 0);
    
    let departureDateTime = getNextMonday().setHours(connection.departureTime.split(':')[0], 
      connection.departureTime.split(':')[1], 0);

    expect(calculateTravelTime(departureDateTime, arrivalDateTime)).toBe(connection.travelTime);

  }
});

class Connection{
  constructor(departureTime, arrivalTime, travelTime, price, isDirect){
    this.departureTime = departureTime;
    this.arrivalTime = arrivalTime;
    this.travelTime = travelTime;
    this.price = price;
    this.isDirect = isDirect;
  }
}