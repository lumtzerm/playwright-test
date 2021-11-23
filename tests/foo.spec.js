//$env:PWDEBUG=1 
const { test, expect } = require('@playwright/test');

test('basic test', async ({ page }) => {
  await page.goto('https://novy.regiojet.cz/');

  await page.click('button:has-text("Přijmout vše")');

  await page.fill('[aria-label="Odkud"]', 'Ostrava');
  await page.press('[aria-label="Odkud"]', 'Enter');

  await page.fill('[aria-label="Kam"]', 'Brno');
  await page.press('[aria-label="Kam"]', 'Enter');

  await page.click('[data-id="departure-date"]');

  await page.click('.CalendarDay__firstDayOfWeek:text-is(" ' + getNextMondayDate(getNextMonday()) + ' ")') ;

  await page.click('text=Hledat');

  //wait till connection cards are loaded
  await page.waitForSelector('ul > li > div');
  // let list = await page.$$('ul > li > div >> text=Přímý');
  // const list = await page.$$('ul > li > div * > h2');

  //list all connection cards
  const list = await page.$$('ul > li > div');

  const connections = [];

  for (const element of list) {


    //document.querySelectorAll('ul > li > div * > span[aria-label~="cesty"]')
    let departureArrival = (await (await element.$(' * > h2')).innerText()).split(' - ');
    let travelTime = (await (await element.$(' * > h2 > span')).innerText()).split(' ');
    let price = (await (await element.$(' * > button')).innerText()).split( );
    let isDirect = (await element.innerText()).includes('Přímý');

    let connection = new Connection(departureArrival[0], departureArrival[1], price[0], isDirect);
    
    connections.push(connection);    
  };
  
  //let travelTimeArray = travelTime.split(' - ');
  //let arrivalTime = travelTimeArray[1];
  //arrivalDateTime.setHours(arrivalTime.split(':')[0], arrivalTime.split(':')[1], 0);
  //let travelMinutes = Math.abs(Math.round((travelTime / 1000) / 60);
  //

  console.log(connections);
  
  let test = 'tst';

});

class Connection{
  constructor(departure, arrival, price, isDirect){
    this.departure = departure;
    this.arrival = arrival;
    this.price = price;
    this.isDirect = isDirect;
  }
}

function getNextMonday(){
  var nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + (((1 + 7 - nextMonday.getDay()) % 7) || 7));
  return nextMonday;
}

function getNextMondayDate(nextMonday){
  var nextMondayDate = nextMonday;
  return nextMondayDate.getUTCDate();
}