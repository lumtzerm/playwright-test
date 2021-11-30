//$env:PWDEBUG=1
const { test, expect } = require("@playwright/test");
const { Helpers } = require("../src/helpers/helper");
const { Connection } = require("../src/dataObjects/connection");
const helpers = new Helpers();

test("basic test", async ({ page }) => {
  await page.goto("https://novy.regiojet.cz/");

  await page.click('button:has-text("Přijmout vše")');

  let odkud = "Odkud";
  await page.fill(`[aria-label="${odkud}"]`, "Ostrava");

  //await page.fill('[aria-label="Odkud"]', "Ostrava");
  await page.press('[aria-label="Odkud"]', "Enter");

  await page.fill('[aria-label="Kam"]', "Brno");
  await page.press('[aria-label="Kam"]', "Enter");

  await page.click('[data-id="departure-date"]');

  await page.click(
    '.CalendarDay__firstDayOfWeek:text-is(" ' +
      helpers.getNextMondayDayDate(helpers.getNextMonday()) +
      ' ")'
  );

  await page.click("text=Hledat");

  //wait till connection cards are loaded
  await page.waitForSelector("ul > li > div");

  //list all connection cards
  const list = await page.$$("ul > li > div");

  const connections = [];

  for (const element of list) {
    //const is block scoped
    let departureAndArrivalTime = (
      await (await element.$(" * > h2")).innerText()
    ).split(" - ");

    let travelTimeArray = (
      await (await element.$(" * > span")).innerText()
    ).split(/(\s+)/);

    let priceArray = (await (await element.$(" * > button")).innerText()).split(
      /(\s+)/
    );

    let price = "NotInitialized";
    //TODO: extract to function, rewrite as ternary

    if (priceArray.length === 3) {
      price = priceArray[0];
    } else {
      price = priceArray[2];
    }

    let isDirect = (await element.innerText()).includes("Přímý");

    let connection = new Connection(
      departureAndArrivalTime[0],
      departureAndArrivalTime[1],
      travelTimeArray[0],
      price,
      isDirect
    );

    connections.push(connection);
  }

  /*sort by travel time, ascending
  console.log(
    connections.sort(
      (a, b) =>
        helpers.calculateTravelMinutes(a.travelTime) -
        helpers.calculateTravelMinutes(b.travelTime)
    )
  );*/

  //sort by price, ascending | does not need parseInt because we are deducting in sort
  //console.log(connections.sort((a, b) => a.price - b.price));

  //verify displayed travel time equals actual travel time
  for (const connection of connections) {
    let arrivalDateTime = helpers
      .getNextMonday()
      .setHours(
        connection.arrivalTime.split(":")[0],
        connection.arrivalTime.split(":")[1],
        0
      );

    let departureDateTime = helpers
      .getNextMonday()
      .setHours(
        connection.departureTime.split(":")[0],
        connection.departureTime.split(":")[1],
        0
      );

    expect(
      helpers.calculateTravelTime(departureDateTime, arrivalDateTime)
    ).toBe(connection.travelTime);
  }
});
