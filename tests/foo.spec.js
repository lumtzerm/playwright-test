//$env:PWDEBUG=1 
const { test, expect } = require('@playwright/test');
const { assertions } = require('expect');

test('basic test', async ({ page }) => {
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
    let travelTime = (await (await element.$(' * > span')).innerText()).split(/(\s+)/);
    let price = (await (await element.$(' * > button')).innerText()).split(/(\s+)/);
    let isDirect = (await element.innerText()).includes('Přímý');

    let connection = new Connection(departureArrival[0], departureArrival[1], travelTime[0], price[2], isDirect);
    
    connections.push(connection);    
  };
  
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

function getNextMonday(){
  var nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + (((1 + 7 - nextMonday.getDay()) % 7) || 7));
  return nextMonday;
}

function getNextMondayDayDate(nextMonday){
  //TODO: refactor, remove unnecessary variable
  var nextMondayDate = nextMonday;
  return nextMondayDate.getUTCDate();
}

function calculateTravelTime(departureTime, arrivalTime){
  var travelTimeTotal = Math.abs(Math.round(((arrivalTime - departureTime)) / 1000) / 60);
  var travelHours = Math.floor(travelTimeTotal/60) < 10 ? 
    `0${Math.floor(travelTimeTotal/60).toString()}` : Math.floor(travelTimeTotal/60).toString();

  var travelMinutes = (travelTimeTotal%60) < 10 ? 
    `0${(travelTimeTotal%60).toString()}` : (travelTimeTotal%60).toString();
  
  return `${travelHours}:${travelMinutes}`;
}